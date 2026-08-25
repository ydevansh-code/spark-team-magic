import type {
  AssembleResult,
  Candidate,
  Project,
  ServiceError,
  TeamMember,
  UserProfile,
} from "@/types/project-match";
import { mockCandidates, mockProfile, mockProjects } from "./mock-data";

/**
 * Service layer / API abstraction.
 *
 * Every screen talks to this module only. Swap the mock bodies for real
 * fetch/server-function calls later without touching a single component.
 */

const LATENCY = 550;

/** Set to a number 0..1 in the console to exercise error states: window.__pmFailRate = 1 */
declare global {
  interface Window {
    __pmFailRate?: number;
  }
}

function failRate() {
  if (typeof window === "undefined") return 0;
  return window.__pmFailRate ?? 0;
}

export function isServiceError(value: unknown): value is ServiceError {
  return typeof value === "object" && value !== null && "code" in value && "retryable" in value;
}

export function errorMessage(error: unknown): string {
  if (isServiceError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

function fail(code: ServiceError["code"], message: string, retryable = true): ServiceError {
  return { code, message, retryable };
}

async function simulate<T>(value: T | (() => T), label: string): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, LATENCY));
  if (Math.random() < failRate()) {
    throw fail("network", `Couldn't ${label}. Check your connection and retry.`);
  }
  return typeof value === "function" ? (value as () => T)() : value;
}

/* ------------------------------- in-memory store ------------------------------- */

let projects: Project[] = mockProjects.map((p) => ({ ...p }));
let profile: UserProfile = { ...mockProfile };
const team = new Map<string, TeamMember[]>(
  projects.map((p) => [
    p.id,
    p.memberIds.map((id) => ({ candidateId: id, addedAt: p.createdAt, status: "on-team" as const })),
  ]),
);

/* ---------------------------------- profile ---------------------------------- */

export const profileService = {
  get: () => simulate(() => ({ ...profile }), "load your profile"),
  update: (patch: Partial<UserProfile>) =>
    simulate(() => {
      if (patch.displayName !== undefined && patch.displayName.trim().length < 2) {
        throw fail("validation", "Display name needs at least 2 characters.", false);
      }
      profile = { ...profile, ...patch };
      return { ...profile };
    }, "save your profile"),
};

/* ---------------------------------- projects --------------------------------- */

export interface CreateProjectInput {
  title: string;
  description: string;
  neededRoles: string[];
  teamSizeTarget: number;
}

export const projectService = {
  list: () => simulate(() => projects.map((p) => ({ ...p })), "load your projects"),
  get: (id: string) =>
    simulate(() => {
      const found = projects.find((p) => p.id === id);
      if (!found) throw fail("not_found", "That project no longer exists.", false);
      return { ...found };
    }, "load the project"),
  create: (input: CreateProjectInput) =>
    simulate(() => {
      if (!input.title.trim()) throw fail("validation", "Give your project a title.", false);
      if (input.neededRoles.length === 0) {
        throw fail("validation", "Pick at least one role you're looking for.", false);
      }
      const project: Project = {
        id: `p${Date.now()}`,
        title: input.title.trim(),
        description: input.description.trim(),
        neededRoles: input.neededRoles,
        teamSizeTarget: input.teamSizeTarget,
        createdAt: new Date().toISOString(),
        memberIds: [],
      };
      projects = [project, ...projects];
      team.set(project.id, []);
      return project;
    }, "create the project"),
  remove: (id: string) =>
    simulate(() => {
      projects = projects.filter((p) => p.id !== id);
      team.delete(id);
      return { id };
    }, "delete the project"),
};

/* ---------------------------------- matching --------------------------------- */

export const matchService = {
  listCandidates: (projectId: string) =>
    simulate(() => {
      const current = team.get(projectId) ?? [];
      const ids = new Set(current.map((m) => m.candidateId));
      return mockCandidates
        .map((c) => ({ ...c, onTeam: ids.has(c.id) }))
        .sort((a, b) => b.matchScore - a.matchScore) as (Candidate & { onTeam: boolean })[];
    }, "load matches"),

  magicAssemble: (projectId: string): Promise<AssembleResult> =>
    simulate(() => {
      const picks = [...mockCandidates].sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);
      const members: TeamMember[] = picks.map((c) => ({
        candidateId: c.id,
        addedAt: new Date().toISOString(),
        status: "on-team",
      }));
      team.set(projectId, members);
      return {
        members,
        summary: `Team assembled: Team of ${members.length + 1} people instantly`,
      };
    }, "assemble a team"),
};

/* ------------------------------------ team ----------------------------------- */

export const teamService = {
  list: (projectId: string) =>
    simulate(() => {
      const members = team.get(projectId) ?? [];
      return members.map((m) => ({
        member: m,
        candidate: mockCandidates.find((c) => c.id === m.candidateId)!,
      }));
    }, "load your team"),
  add: (projectId: string, candidateId: string) =>
    simulate(() => {
      const members = team.get(projectId) ?? [];
      if (members.some((m) => m.candidateId === candidateId)) return members;
      const next: TeamMember[] = [
        ...members,
        { candidateId, addedAt: new Date().toISOString(), status: "on-team" },
      ];
      team.set(projectId, next);
      return next;
    }, "add that teammate"),
  remove: (projectId: string, candidateId: string) =>
    simulate(() => {
      const next = (team.get(projectId) ?? []).filter((m) => m.candidateId !== candidateId);
      team.set(projectId, next);
      return next;
    }, "remove that teammate"),
};
