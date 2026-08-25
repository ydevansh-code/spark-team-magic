import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowDown, Loader2, Pencil, Plus, Search, Sparkles } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/pm/confirm-dialog";
import { CreateProjectModal } from "@/components/pm/create-project-modal";
import { CurrentTeam } from "@/components/pm/current-team";
import { MatchCard } from "@/components/pm/match-card";
import { ProfileEditModal } from "@/components/pm/profile-modal";
import { EmptyState, ErrorState, MatchListSkeleton } from "@/components/pm/states";
import {
  errorMessage,
  matchService,
  profileService,
  projectService,
  teamService,
} from "@/services/project-match-service";
import type { Candidate } from "@/types/project-match";

export const Route = createFileRoute("/workspace")({
  head: () => ({
    meta: [
      { title: "Your workspace — ProjectMatch" },
      {
        name: "description",
        content:
          "Manage your projects, run Magic Assemble, and review why each teammate match complements your skills.",
      },
      { property: "og:title", content: "Your workspace — ProjectMatch" },
      {
        property: "og:description",
        content: "Run Magic Assemble and review complementary teammate matches for your project.",
      },
    ],
  }),
  component: Workspace,
});

function Workspace() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [confirm, setConfirm] = useState<null | { kind: "remove"; candidate: Candidate }>(null);
  const [reassembleOpen, setReassembleOpen] = useState(false);
  const [hasPromptedProfile, setHasPromptedProfile] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate({ to: "/login" });
    });
  }, [navigate]);

  const projectsQ = useQuery({ queryKey: ["projects"], queryFn: projectService.list });
  const profileQ = useQuery({ queryKey: ["profile"], queryFn: profileService.get });

  // Prompt users to fill out their profile if it's empty on first load
  useEffect(() => {
    if (profileQ.data && !hasPromptedProfile) {
      setHasPromptedProfile(true);
      if (profileQ.data.skills.length === 0 && profileQ.data.wantsToLearn.length === 0) {
        setProfileOpen(true);
      }
    }
  }, [profileQ.data, hasPromptedProfile]);

  const projects = projectsQ.data ?? [];
  const projectId = activeId ?? projects[0]?.id ?? null;
  const project = projects.find((p) => p.id === projectId);

  const matchesQ = useQuery({
    queryKey: ["matches", projectId],
    queryFn: () => matchService.listCandidates(projectId!),
    enabled: !!projectId,
  });
  const teamQ = useQuery({
    queryKey: ["team", projectId],
    queryFn: () => teamService.list(projectId!),
    enabled: !!projectId,
  });

  const teamIds = useMemo(
    () => new Set((teamQ.data ?? []).map((e) => e.candidate.id)),
    [teamQ.data],
  );

  function invalidateTeam() {
    qc.invalidateQueries({ queryKey: ["team", projectId] });
    qc.invalidateQueries({ queryKey: ["matches", projectId] });
  }

  const addM = useMutation({
    mutationFn: (candidateId: string) => teamService.add(projectId!, candidateId),
    onSuccess: (_d, candidateId) => {
      invalidateTeam();
      const name = matchesQ.data?.find((c) => c.id === candidateId)?.displayName ?? "Teammate";
      toast.success(`${name} added to your team`, {
        action: {
          label: "Undo",
          onClick: () => removeM.mutate(candidateId),
        },
      });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const removeM = useMutation({
    mutationFn: (candidateId: string) => teamService.remove(projectId!, candidateId),
    onSuccess: () => {
      invalidateTeam();
      toast.success("Teammate removed");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const assembleM = useMutation({
    mutationFn: () => matchService.magicAssemble(projectId!),
    onSuccess: (result) => {
      invalidateTeam();
      toast.success(result.summary);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()),
  );
  const matches = matchesQ.data ?? [];
  const visibleMatches = showAll ? matches : matches.slice(0, 5);

  return (
    <div className="min-h-dvh bg-background p-3 sm:p-5">
      <div className="frame-mint mx-auto flex max-w-6xl flex-col overflow-hidden lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full shrink-0 space-y-5 bg-sidebar p-4 lg:w-72" aria-label="Projects">
          <Link to="/" className="block text-center text-xs font-bold tracking-[0.2em] text-mint">
            PROJECTS
          </Link>

          <div className="relative">
            <Search
              className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects"
              aria-label="Search projects"
              className="pl-9"
            />
          </div>

          <Button className="w-full" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" aria-hidden="true" />
            Create
          </Button>

          {projectsQ.isPending ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : projectsQ.isError ? (
            <ErrorState error={projectsQ.error} onRetry={() => projectsQ.refetch()} />
          ) : filteredProjects.length === 0 ? (
            <EmptyState>No projects match "{search}".</EmptyState>
          ) : (
            <ul className="space-y-1">
              {filteredProjects.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(p.id)}
                    aria-current={p.id === projectId ? "true" : undefined}
                    className={`w-full rounded-lg px-3 py-2 text-left transition-colors ${
                      p.id === projectId ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/60"
                    }`}
                  >
                    <span className="block truncate text-sm font-bold">{p.title}</span>
                    <span className="block text-xs text-muted-foreground">
                      {p.memberIds.length} members
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <Button variant="outline" className="w-full" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" aria-hidden="true" />
            New Project
          </Button>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1 space-y-6 p-4 sm:p-6">
          {!project ? (
            <EmptyState>Create your first project to start matching.</EmptyState>
          ) : (
            <>
              <header className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold">{project.title}</h1>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Looking for {project.teamSizeTarget - 1} teammates ·{" "}
                    {teamQ.data?.length ?? 0} already joined
                  </p>
                </div>

                <div className="text-right text-xs">
                  <div className="flex items-center justify-end gap-2">
                    <span className="font-bold">
                      {profileQ.data?.displayName ?? "Your Profile"}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="min-h-11 min-w-11"
                      aria-label="Edit your profile"
                      onClick={() => setProfileOpen(true)}
                      disabled={!profileQ.data}
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                  {profileQ.isPending ? (
                    <Skeleton className="ml-auto mt-1 h-3 w-40" />
                  ) : profileQ.isError ? (
                    <button
                      className="text-destructive underline"
                      onClick={() => profileQ.refetch()}
                    >
                      Profile failed to load — retry
                    </button>
                  ) : (
                    <p className="mt-1 max-w-[15rem] text-muted-foreground">
                      Your skills:{" "}
                      {profileQ.data.skills.map((s) => `${s.name} (${s.level})`).join(", ")}
                    </p>
                  )}
                </div>
              </header>

              <div className="flex flex-wrap gap-2">
                {project.neededRoles.map((role) => (
                  <Badge key={role} variant="outline">
                    {role}
                  </Badge>
                ))}
              </div>

              <div className="text-center">
                <Button
                  size="lg"
                  className="glow-mint rounded-full px-8"
                  onClick={() =>
                    (teamQ.data?.length ?? 0) > 0
                      ? setReassembleOpen(true)
                      : assembleM.mutate()
                  }
                  disabled={assembleM.isPending}
                >
                  {assembleM.isPending ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Sparkles className="size-4" aria-hidden="true" />
                  )}
                  Magic Assemble
                </Button>
                <p className="mt-2 text-[11px] text-mint" aria-live="polite">
                  {assembleM.isPending
                    ? "Balancing skills across your project…"
                    : (teamQ.data?.length ?? 0) > 0
                      ? `Team assembled: Team of ${(teamQ.data?.length ?? 0) + 1} people`
                      : "One click for a balanced 3-4 person team"}
                </p>
              </div>

              {teamQ.isPending ? (
                <MatchListSkeleton rows={2} />
              ) : teamQ.isError ? (
                <ErrorState
                  error={teamQ.error}
                  title="Couldn't load your team"
                  onRetry={() => teamQ.refetch()}
                />
              ) : (
                <CurrentTeam
                  entries={teamQ.data}
                  target={project.teamSizeTarget}
                  onRemove={(id) => {
                    const candidate = teamQ.data.find((e) => e.candidate.id === id)?.candidate;
                    if (candidate) setConfirm({ kind: "remove", candidate });
                  }}
                />
              )}

              <section aria-labelledby="why-heading" className="space-y-3">
                <h2 id="why-heading" className="text-sm font-bold">
                  Why this match?
                </h2>

                {matchesQ.isPending ? (
                  <MatchListSkeleton />
                ) : matchesQ.isError ? (
                  <ErrorState
                    error={matchesQ.error}
                    title="Couldn't load matches"
                    onRetry={() => matchesQ.refetch()}
                  />
                ) : matches.length === 0 ? (
                  <EmptyState>No matches yet — add more detail to your project.</EmptyState>
                ) : (
                  <>
                    <ul className="space-y-3">
                      {visibleMatches.map((candidate) => (
                        <MatchCard
                          key={candidate.id}
                          candidate={candidate}
                          onTeam={teamIds.has(candidate.id)}
                          pending={
                            (addM.isPending && addM.variables === candidate.id) ||
                            (removeM.isPending && removeM.variables === candidate.id)
                          }
                          onAdd={() => addM.mutate(candidate.id)}
                          onRemove={() => setConfirm({ kind: "remove", candidate })}
                        />
                      ))}
                    </ul>
                    {matches.length > 5 ? (
                      <div className="text-center">
                        <Button variant="ghost" size="sm" onClick={() => setShowAll((v) => !v)}>
                          <ArrowDown className="size-3.5" aria-hidden="true" />
                          {showAll ? "Fewer matches" : "More matches"}
                        </Button>
                      </div>
                    ) : null}
                  </>
                )}
              </section>
            </>
          )}
        </main>
      </div>

      {profileQ.data ? (
        <ProfileEditModal
          open={profileOpen}
          onOpenChange={setProfileOpen}
          profile={profileQ.data}
          onSaved={(next) => qc.setQueryData(["profile"], next)}
        />
      ) : null}

      <CreateProjectModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(project) => {
          qc.invalidateQueries({ queryKey: ["projects"] });
          setActiveId(project.id);
        }}
      />

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={`Remove ${confirm?.candidate.displayName ?? "teammate"}?`}
        description="They'll lose their seat on this project. You can add them back from matches."
        confirmLabel="Remove"
        destructive
        onConfirm={() => {
          if (confirm) removeM.mutate(confirm.candidate.id);
          setConfirm(null);
        }}
      />

      <ConfirmDialog
        open={reassembleOpen}
        onOpenChange={setReassembleOpen}
        title="Re-assemble this team?"
        description="Magic Assemble replaces everyone currently on the team with a fresh balanced set."
        confirmLabel="Re-assemble"
        onConfirm={() => {
          setReassembleOpen(false);
          assembleM.mutate();
        }}
      />
    </div>
  );
}
