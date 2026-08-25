import { AlertTriangle, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { errorMessage, isServiceError } from "@/services/project-match-service";

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
    <div
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
    </div>
  );
}

export function MatchListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading matches…</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-lg bg-surface p-4">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-2 w-full" />
          </div>
          <Skeleton className="size-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg bg-surface px-4 py-5 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
