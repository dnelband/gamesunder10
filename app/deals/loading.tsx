import {
  DealFiltersSkeleton,
  DealsGridSkeleton,
} from "./deals-grid-skeleton";

export default function DealsLoading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Deals under €10</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Sorted by original price (highest first), then release date (newest
          first).
        </p>
      </header>
      <DealFiltersSkeleton />
      <DealsGridSkeleton />
    </div>
  );
}
