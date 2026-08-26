/** Reusable Apple HIG skeleton loaders */
export function SkeletonRow({ className = 'h-4 w-full' }) {
  return <div className={`skeleton ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="apple-card p-6 space-y-4 border border-border">
      <div className="flex items-center justify-between">
        <div className="skeleton h-4 w-1/3" />
        <div className="skeleton h-8 w-8 rounded-xl" />
      </div>
      <div className="skeleton h-8 w-1/2" />
      <div className="space-y-2 pt-2">
        <div className="skeleton h-3.5 w-full" />
        <div className="skeleton h-3.5 w-4/5" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="apple-card overflow-hidden border border-border">
      <div className="p-4 border-b border-border bg-surface flex items-center justify-between">
        <div className="skeleton h-5 w-48" />
        <div className="skeleton h-8 w-32 rounded-xl" />
      </div>
      <div className="p-4 space-y-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4 items-center">
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="skeleton h-4 flex-1 rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function PageSkeleton({ cards = 4 }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: cards }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export default { SkeletonRow, CardSkeleton, TableSkeleton, PageSkeleton };