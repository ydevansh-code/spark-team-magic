import { Check, UserMinus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/pm/states";
import type { Candidate, TeamMember } from "@/types/project-match";
import { motion, AnimatePresence } from "framer-motion";

export function CurrentTeam({
  entries,
  target,
  onRemove,
}: {
  entries: { member: TeamMember; candidate: Candidate }[];
  target: number;
  onRemove: (candidateId: string) => void;
}) {
  return (
    <section aria-labelledby="current-team-heading" className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 id="current-team-heading" className="text-sm font-bold">
          Current team
        </h2>
        <span className="text-xs text-muted-foreground">
          {entries.length + 1} of {target} seats filled
        </span>
      </div>

      {entries.length === 0 ? (
        <EmptyState>
          No teammates selected yet. Use Magic Assemble or add matches below.
        </EmptyState>
      ) : (
        <ul className="space-y-2">
          <AnimatePresence initial={false}>
            {entries.map(({ member, candidate }) => (
              <motion.li
                key={candidate.id}
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: "auto", scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95, margin: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="flex items-center gap-3 rounded-lg bg-surface px-3 py-2 border border-border/50 hover:bg-surface/80 transition-colors"
              >
                <span
                  aria-hidden="true"
                  className="grid size-8 shrink-0 place-items-center rounded-full border border-border bg-background/50 text-[10px] font-bold text-mint"
                >
                  {candidate.initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
                    {candidate.displayName}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {candidate.skills.map((s) => s.name).join(" · ")}
                  </span>
                </span>
                <Badge
                  className={
                    member.status === "on-team"
                      ? "gap-1 bg-primary text-primary-foreground shrink-0"
                      : "gap-1 shrink-0"
                  }
                  variant={member.status === "on-team" ? "default" : "outline"}
                >
                  {member.status === "on-team" ? (
                    <>
                      <Check className="size-3" aria-hidden="true" />
                      On Team
                    </>
                  ) : (
                    "Invited"
                  )}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="min-h-11 min-w-11 shrink-0 hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`Remove ${candidate.displayName} from team`}
                  onClick={() => onRemove(candidate.id)}
                >
                  <UserMinus className="size-4" aria-hidden="true" />
                </Button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}
