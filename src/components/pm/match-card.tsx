import { Check, Github, Linkedin, Loader2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScoreRing } from "@/components/pm/score-ring";
import type { Candidate } from "@/types/project-match";
import { cn } from "@/lib/utils";

export function MatchCard({
  candidate,
  onTeam,
  pending,
  onAdd,
  onRemove,
}: {
  candidate: Candidate;
  onTeam: boolean;
  pending?: boolean;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <li
      className={cn(
        "rounded-xl bg-surface p-4 transition-shadow",
        onTeam && "ring-mint bg-surface-2",
      )}
    >
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-full border border-border text-xs font-bold text-mint"
        >
          {candidate.initials}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold">{candidate.displayName}</h3>
            {candidate.githubUrl && (
              <a href={candidate.githubUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                <Github className="size-4" />
              </a>
            )}
            {candidate.linkedinUrl && (
              <a href={candidate.linkedinUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                <Linkedin className="size-4" />
              </a>
            )}
            {onTeam ? (
              <Badge className="gap-1 bg-primary text-primary-foreground">
                <Check className="size-3" aria-hidden="true" />
                On Team
              </Badge>
            ) : null}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{candidate.headline}</p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {candidate.reasons.map((reason) => (
              <Badge key={reason} variant="outline" className="text-[10px] font-medium">
                {reason}
              </Badge>
            ))}
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            {candidate.gapFilled ? (
              <span className="text-foreground">Fills your {candidate.gapFilled} gap — </span>
            ) : null}
            {candidate.explanation}
          </p>

          <div className="mt-3 flex items-center gap-3">
            <Progress value={candidate.overlap} className="h-1.5 flex-1" />
            <span className="text-[10px] text-muted-foreground">
              {candidate.overlap}% skill overlap
            </span>
          </div>
        </div>

        <ScoreRing score={candidate.matchScore} />
      </div>

      <div className="mt-3 flex justify-end">
        {onTeam ? (
          <Button variant="outline" size="sm" onClick={onRemove} disabled={pending}>
            Remove from team
          </Button>
        ) : (
          <Button size="sm" onClick={onAdd} disabled={pending}>
            {pending ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Plus className="size-3.5" aria-hidden="true" />
            )}
            Add to Team
          </Button>
        )}
      </div>
    </li>
  );
}
