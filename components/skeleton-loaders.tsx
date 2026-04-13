// Reusable skeleton loaders for common UI patterns
// Prevents blank screen flashes during data fetching

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
      <div className="space-y-2">
        <div className="h-3 bg-muted rounded w-full animate-pulse" />
        <div className="h-3 bg-muted rounded w-5/6 animate-pulse" />
      </div>
    </div>
  )
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-muted rounded animate-pulse"
          style={{ width: `${100 - i * 10}%` }}
        />
      ))}
    </div>
  )
}

export function SkeletonLeaderboard() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-3 rounded-lg bg-card border border-border"
        >
          <div className="w-8 h-8 bg-muted rounded-full animate-pulse shrink-0" />
          <div className="flex-1 space-y-1">
            <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
            <div className="h-3 bg-muted rounded w-1/4 animate-pulse" />
          </div>
          <div className="h-4 bg-muted rounded w-1/6 animate-pulse" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonPoll() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="h-5 bg-muted rounded w-2/3 animate-pulse" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
            <div className="h-8 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonHeader() {
  return (
    <div className="flex items-center justify-between gap-3 p-4 border-b border-border">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-muted rounded-full animate-pulse shrink-0" />
        <div className="space-y-1">
          <div className="h-4 bg-muted rounded w-24 animate-pulse" />
          <div className="h-3 bg-muted rounded w-16 animate-pulse" />
        </div>
      </div>
      <div className="w-8 h-8 bg-muted rounded animate-pulse" />
    </div>
  )
}
