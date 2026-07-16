import { DEFAULT_PAGE_SIZE } from "@/lib/deals/filters";

export function DealCardSkeleton() {
  return (
    <article
      className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
      aria-hidden
    >
      <div className="aspect-[3/4] animate-pulse bg-zinc-200 dark:bg-zinc-800" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="h-5 w-[80%] animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-1 flex gap-1">
          <div className="h-5 w-14 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-5 w-12 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <div className="mt-auto h-3 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </article>
  );
}

export function DealsGridSkeleton({
  count = DEFAULT_PAGE_SIZE,
}: {
  count?: number;
}) {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-live="polite">
      <div className="h-4 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {Array.from({ length: count }, (_, index) => (
          <li key={index}>
            <DealCardSkeleton />
          </li>
        ))}
      </ul>
      <span className="sr-only">Loading deals…</span>
    </div>
  );
}

export function DealFiltersSkeleton() {
  return (
    <div
      className="h-12 animate-pulse rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"
      aria-hidden
    />
  );
}
