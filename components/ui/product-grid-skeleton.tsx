/** Skeleton grille catalogue (2 col mobile, 4 desktop). */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm"
          style={{ animationDelay: `${Math.min(i, 7) * 60}ms` }}
        >
          <div className="aspect-square w-full animate-shimmer bg-gradient-to-br from-muted via-orange-50/40 to-muted" />
          <div className="space-y-2 p-3">
            <div className="h-4 w-full animate-shimmer rounded-md bg-muted" />
            <div className="h-4 w-2/3 animate-shimmer rounded-md bg-muted" />
            <div className="mt-3 h-9 animate-shimmer rounded-xl bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="mx-auto w-[min(1320px,calc(100%-2rem))] py-6 sm:py-10" aria-hidden>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="aspect-square max-h-[min(70vh,520px)] animate-shimmer rounded-2xl bg-muted" />
        <div className="space-y-4">
          <div className="h-6 w-24 animate-shimmer rounded-lg bg-muted" />
          <div className="h-10 w-full animate-shimmer rounded-lg bg-muted" />
          <div className="h-8 w-32 animate-shimmer rounded-lg bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-full animate-shimmer rounded bg-muted" />
            <div className="h-4 w-full animate-shimmer rounded bg-muted" />
            <div className="h-4 w-4/5 animate-shimmer rounded bg-muted" />
          </div>
          <div className="h-12 animate-shimmer rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  );
}

export function PanierSkeleton() {
  return (
    <div className="container-raaga space-y-3 py-6 sm:py-10" aria-hidden>
      <div className="h-8 w-48 animate-shimmer rounded-lg bg-muted" />
      <div className="mx-auto max-w-xl space-y-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex gap-3 rounded-2xl border border-border/60 bg-card p-4">
            <div className="h-20 w-20 shrink-0 animate-shimmer rounded-xl bg-muted" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-5 w-3/4 animate-shimmer rounded bg-muted" />
              <div className="h-4 w-1/2 animate-shimmer rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
