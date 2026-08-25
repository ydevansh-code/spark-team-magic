import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/supabase";
import type {
  AssembleResult,
  Candidate,
  Project,
  ServiceError,
  Skill,
  TeamMember,
  UserProfile,
} from "@/types/project-match";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type SkillRow = Database["public"]["Tables"]["skills"]["Row"];
type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type TeamMemberRow = Database["public"]["Tables"]["team_members"]["Row"];

export function isServiceError(value: unknown): value is ServiceError {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    "retryable" in value
  );
}

export function errorMessage(error: unknown): string {
  if (isServiceError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

function toServiceError(
  e: unknown,
  code: ServiceError["code"] = "server"
): ServiceError {
  return {
    code,
    message: errorMessage(e),
    retryable: code !== "validation" && code !== "not_found",
  };
}

function mapSkills(skills: SkillRow[]): { known: Skill[]; wantsToLearn: string[] } {
  return {
    known: skills
      .filter((s) => s.category === "known")
      .map((s) => ({ id: s.id, name: s.skill_name, level: "intermediate" as const })),
    wantsToLearn: skills
      .filter((s) => s.category === "wants_to_learn")
      .map((s) => s.skill_name),
  };
}

function mapProject(p: ProjectRow): Project {
  return {
    id: p.id,
    title: p.title,
    description: p.description ?? "",
    neededRoles: p.needed_roles ?? [],
    teamSizeTarget: p.team_size_target ?? 4,
    createdAt: p.created_at,
    memberIds: [],
  };
}

function mapCandidate(
  p: ProfileRow & { skills: SkillRow[] },
  project: Project,
  teamIds: Set<string>
): Candidate & { onTeam: boolean } {
  const { known, wantsToLearn } = mapSkills(p.skills);
  const filledRoles = project.neededRoles.filter((role) =>
    known.some((s) => s.name.toLowerCase().includes(role.toLowerCase()))
  );
  const score = Math.min(100, filledRoles.length * 40 + (wantsToLearn.length > 0 ? 20 : 0));

  return {
    id: p.id,
    initials: p.display_name?.slice(0, 2).toUpperCase() ?? "??",
    displayName: p.display_name ?? "Unknown",
    headline: p.bio ?? "",
    skills: known,
    matchScore: score,
    reasons: filledRoles.length > 0 ? ["Complementary"] : ["Mutual Interest"],
    explanation:
      filledRoles.length > 0
        ? `Fills your ${filledRoles[0]} gap.`
        : "Shares interests with your team.",
    ...(filledRoles[0] ? { gapFilled: filledRoles[0] } : {}),
    overlap: 0,
    onTeam: teamIds.has(p.id),
    githubUrl: p.github_url ?? undefined,
    linkedinUrl: p.linkedin_url ?? undefined,
  };
}

/* ---------------------------------- auth audit ---------------------------------- */

export const authAuditService = {
  async recordLogin(userId: string): Promise<void> {
    await supabase.from("user_login_logs").insert({
      user_id: userId,
      user_agent: navigator.userAgent,
    });
  },

  async getLoginHistory() {
    const { data, error } = await supabase
      .from("user_login_logs")
      .select("*")
      .order("logged_in_at", { ascending: false });
    if (error) throw toServiceError(error);
    return data ?? [];
  },
};

/* ---------------------------------- profile ---------------------------------- */

export const profileService = {
  async get(): Promise<UserProfile> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw toServiceError(new Error("Not authenticated"), "server");

    const { data: profile, error: pe } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (pe) throw toServiceError(pe, "server");

    const { data: skills, error: se } = await supabase
      .from("skills")
      .select("*")
      .eq("profile_id", user.id);
    if (se) throw toServiceError(se, "server");

    const { known, wantsToLearn } = mapSkills(skills ?? []);

    return {
      id: profile.id,
      displayName: profile.display_name ?? user.email ?? "User",
      rawDescription: profile.bio ?? "",
      availability: (profile.availability ?? "part-time") as UserProfile["availability"],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      githubUrl: profile.github_url ?? undefined,
      linkedinUrl: profile.linkedin_url ?? undefined,
      skills: known,
      wantsToLearn,
    };
  },

  async update(patch: Partial<UserProfile>): Promise<UserProfile> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw toServiceError(new Error("Not authenticated"), "server");

    if (patch.displayName !== undefined && patch.displayName.trim().length < 2) {
      throw toServiceError(
        new Error("Display name needs at least 2 characters."),
        "validation"
      );
    }

    const { error: pe } = await supabase
      .from("profiles")
      .update({
        display_name: patch.displayName,
        bio: patch.rawDescription,
        availability: patch.availability,
        github_url: patch.githubUrl,
        linkedin_url: patch.linkedinUrl,
      })
      .eq("id", user.id);
    if (pe) throw toServiceError(pe);

    if (patch.skills !== undefined || patch.wantsToLearn !== undefined) {
      await supabase.from("skills").delete().eq("profile_id", user.id);

      const known = (patch.skills ?? []).map((s) => ({
        profile_id: user.id,
        skill_name: s.name,
        category: "known" as const,
      }));
      const learn = (patch.wantsToLearn ?? []).map((name) => ({
        profile_id: user.id,
        skill_name: name,
        category: "wants_to_learn" as const,
      }));

      const rows = [...known, ...learn];
      if (rows.length > 0) {
        const { error: se } = await supabase.from("skills").insert(rows);
        if (se) throw toServiceError(se);
      }
    }

    return profileService.get();
  },
};

/* ---------------------------------- projects ---------------------------------- */

export interface CreateProjectInput {
  title: string;
  description: string;
  neededRoles: string[];
  teamSizeTarget: number;
}

export const projectService = {
  async list(): Promise<Project[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });
    if (error) throw toServiceError(error);

    return (data ?? []).map(mapProject);
  },

  async get(id: string): Promise<Project> {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw toServiceError(error, "not_found");
    return mapProject(data);
  },

  async create(input: CreateProjectInput): Promise<Project> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw toServiceError(new Error("Not authenticated"), "server");

    if (!input.title.trim())
      throw toServiceError(new Error("Give your project a title."), "validation");
    if (input.neededRoles.length === 0) {
      throw toServiceError(
        new Error("Pick at least one role you're looking for."),
        "validation"
      );
    }

    const { data, error } = await supabase
      .from("projects")
      .insert({
        owner_id: user.id,
        title: input.title.trim(),
        description: input.description.trim(),
        needed_roles: input.neededRoles,
        team_size_target: input.teamSizeTarget,
      })
      .select()
      .single();
    if (error) throw toServiceError(error);

    return mapProject(data);
  },

  async remove(id: string): Promise<{ id: string }> {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) throw toServiceError(error);
    return { id };
  },
};

/* ---------------------------------- matching ---------------------------------- */

export const matchService = {
  async listCandidates(projectId: string): Promise<(Candidate & { onTeam: boolean })[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: teamRows } = await supabase
      .from("team_members")
      .select("candidate_id")
      .eq("project_id", projectId);
    const teamIds = new Set((teamRows ?? []).map((r) => r.candidate_id));

    const { data: profiles, error: pe } = await supabase
      .from("profiles")
      .select("*, skills(*)")
      .neq("id", user.id);
    if (pe) throw toServiceError(pe);

    const project = await projectService.get(projectId);

    return (profiles ?? []).map((p) =>
      mapCandidate(p as ProfileRow & { skills: SkillRow[] }, project, teamIds)
    );
  },

  async magicAssemble(projectId: string): Promise<AssembleResult> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw toServiceError(new Error("Not authenticated"), "server");

    const { data: existingTeamRows } = await supabase
      .from("team_members")
      .select("*, profiles(*, skills(*))")
      .eq("project_id", projectId);

    const existingTeam = (existingTeamRows ?? []).map(
      (r: TeamMemberRow & { profiles: ProfileRow & { skills: SkillRow[] } }) => r.profiles
    );

    const candidates = await matchService.listCandidates(projectId);
    const unassigned = candidates.filter((c) => !c.onTeam);

    if (unassigned.length === 0) {
      return { members: [], summary: "No candidates available to assemble." };
    }

    const project = await projectService.get(projectId);

    const { data: scored, error } = await supabase.functions.invoke<
      { candidateId: string; score: number; reasons: string[] }[]
    >("match-score", {
      body: { project, candidates: unassigned, existingTeam },
    });
    if (error) throw toServiceError(error);

    const top3 = (scored ?? [])
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    if (top3.length === 0) return { members: [], summary: "No matches returned from scoring." };

    const inserts = top3.map((tc) => ({
      project_id: projectId,
      candidate_id: tc.candidateId,
      role:
        unassigned.find((c) => c.id === tc.candidateId)?.skills?.[0]?.name ?? "Contributor",
    }));

    const { error: ie } = await supabase
      .from("team_members")
      .upsert(inserts, { onConflict: "project_id,candidate_id" });
    if (ie) throw toServiceError(ie);

    const members: TeamMember[] = top3.map((tc) => ({
      candidateId: tc.candidateId,
      addedAt: new Date().toISOString(),
      status: "on-team" as const,
    }));

    return {
      members,
      summary: `Team assembled: Top ${members.length} matches added by AI`,
    };
  },
};

/* ---------------------------------- team ---------------------------------- */

export const teamService = {
  async list(projectId: string) {
    const { data, error } = await supabase
      .from("team_members")
      .select("*, profiles(*, skills(*))")
      .eq("project_id", projectId);
    if (error) throw toServiceError(error);

    return (data ?? []).map((row) => {
      const p = row.profiles as ProfileRow & { skills: SkillRow[] };
      const { known } = mapSkills(p.skills ?? []);
      return {
        member: {
          candidateId: row.candidate_id,
          addedAt: row.added_at,
          status: "on-team" as const,
        } satisfies TeamMember,
        candidate: {
          id: p.id,
          initials: p.display_name?.slice(0, 2).toUpperCase() ?? "??",
          displayName: p.display_name ?? "Unknown",
          headline: p.bio ?? "",
          skills: known,
          matchScore: 0,
          reasons: [],
          explanation: "",
          overlap: 0,
        } satisfies Candidate,
      };
    });
  },

  async add(projectId: string, candidateId: string): Promise<TeamMember[]> {
    const { error } = await supabase.from("team_members").upsert(
      { project_id: projectId, candidate_id: candidateId },
      { onConflict: "project_id,candidate_id" }
    );
    if (error) throw toServiceError(error);

    const rows = await teamService.list(projectId);
    return rows.map((r) => r.member);
  },

  async remove(projectId: string, candidateId: string): Promise<TeamMember[]> {
    const { error } = await supabase
      .from("team_members")
      .delete()
      .match({ project_id: projectId, candidate_id: candidateId });
    if (error) throw toServiceError(error);

    const rows = await teamService.list(projectId);
    return rows.map((r) => r.member);
  },
};
