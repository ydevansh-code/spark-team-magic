import { Check, Github, Linkedin, Loader2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScoreRing } from "@/components/pm/score-ring";
import type { Candidate } from "@/types/project-match";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

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
    <motion.li
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "rounded-xl bg-surface p-4 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-mint/30 border border-transparent",
        onTeam && "ring-1 ring-mint bg-surface-2 shadow-[0_0_20px_rgba(45,212,191,0.1)]",
      )}
    >
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-background/50 backdrop-blur-sm text-xs font-bold text-mint"
        >
          {candidate.initials}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold">{candidate.displayName}</h3>
            {candidate.githubUrl && (
              <a href={candidate.githubUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="size-4" />
              </a>
            )}
            {candidate.linkedinUrl && (
              <a href={candidate.linkedinUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
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
              <Badge key={reason} variant="outline" className="text-[10px] font-medium bg-background/30">
                {reason}
              </Badge>
            ))}
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            {candidate.gapFilled ? (
              <span className="text-foreground font-medium">Fills your {candidate.gapFilled} gap — </span>
            ) : null}
            {candidate.explanation}
          </p>

          <div className="mt-3 flex items-center gap-3">
            <Progress value={candidate.overlap} className="h-1.5 flex-1 bg-muted overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-mint to-blue-400 transition-all"
                style={{ width: `${candidate.overlap}%` }}
              />
            </Progress>
            <span className="text-[10px] text-muted-foreground font-medium">
              {candidate.overlap}% skill overlap
            </span>
          </div>
        </div>

        <ScoreRing score={candidate.matchScore} />
      </div>

      <div className="mt-3 flex justify-end">
        {onTeam ? (
          <Button variant="outline" size="sm" onClick={onRemove} disabled={pending} className="hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors">
            Remove from team
          </Button>
        ) : (
          <Button size="sm" onClick={onAdd} disabled={pending} className="hover:shadow-[0_0_15px_rgba(45,212,191,0.3)] transition-all">
            {pending ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Plus className="size-3.5" aria-hidden="true" />
            )}
            Add to Team
          </Button>
        )}
      </div>
    </motion.li>
  );
}
