import { AlertTriangle, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { errorMessage, isServiceError } from "@/services/project-match-service";
import { motion } from "framer-motion";

export function ErrorState({
  error,
  onRetry,
  title = "That didn't load",
}: {
  error: unknown;
  onRetry?: () => void;
  title?: string;
}) {
  const retryable = !isServiceError(error) || error.retryable;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      role="alert"
      className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm"
    >
      <p className="flex items-center gap-2 font-semibold text-foreground">
        <AlertTriangle className="size-4 text-destructive" aria-hidden="true" />
        {title}
      </p>
      <p className="mt-1 text-muted-foreground">{errorMessage(error)}</p>
      {retryable && onRetry ? (
        <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Try again
        </Button>
      ) : null}
    </motion.div>
  );
}

export function MatchListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={{ 
        visible: { transition: { staggerChildren: 0.1 } }
      }}
      className="space-y-3" aria-busy="true" aria-live="polite"
    >
      <span className="sr-only">Loading matches…</span>
      {Array.from({ length: rows }).map((_, i) => (
        <motion.div 
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          key={i} 
          className="flex items-center gap-4 rounded-xl bg-surface p-4 border border-border/40 shadow-sm"
        >
          <Skeleton className="size-10 rounded-full bg-muted/50" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-40 bg-muted/50" />
            <Skeleton className="h-2 w-full bg-muted/50" />
          </div>
          <Skeleton className="size-16 rounded-full bg-muted/50" />
        </motion.div>
      ))}
    </motion.div>
  );
}

export function EmptyState({ children, icon }: { children: ReactNode, icon?: ReactNode }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-surface/30 px-6 py-12 text-center text-sm text-muted-foreground backdrop-blur-sm"
    >
      {icon && <div className="text-muted-foreground/50 mb-2">{icon}</div>}
      {children}
    </motion.div>
  );
}
