import { connection } from "next/server";
import { Suspense } from "react";

import {
  getCachedDealFilterOptions,
  getCachedDealsPage,
} from "@/lib/db/deals-cached";
import {
  parseDealFilters,
  parsePage,
  type DealListFilters,
} from "@/lib/deals/filters";

import { DealCard } from "./deal-card";
import { DealPagination } from "./deal-pagination";
import {
  DealFiltersSkeleton,
  DealsGridSkeleton,
} from "./deals-grid-skeleton";
import { DealsShell } from "./deals-shell";

function DealsPageFallback() {
  return (
    <>
      <DealFiltersSkeleton />
      <DealsGridSkeleton />
    </>
  );
}

function resultsKey(filters: DealListFilters, page: number): string {
  return [
    filters.q,
    filters.platforms.join(","),
    filters.genres.join(","),
    filters.minRating ?? "",
    page,
  ].join("|");
}

export default function DealsPage(props: PageProps<"/deals">) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Deals under €10</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Sorted by original price (highest first), then release date (newest
          first).
        </p>
      </header>

      <Suspense fallback={<DealsPageFallback />}>
        <DealsBrowse {...props} />
      </Suspense>
    </div>
  );
}

async function DealsBrowse(props: PageProps<"/deals">) {
  await connection();
  const searchParams = await props.searchParams;
  const filters = parseDealFilters(searchParams);
  const page = parsePage(searchParams);
  const filterOptions = await getCachedDealFilterOptions();

  return (
    <DealsShell
      initialFilters={filters}
      availableGenres={filterOptions.genres}
      availablePlatforms={filterOptions.platforms}
    >
      <Suspense
        key={resultsKey(filters, page)}
        fallback={<DealsGridSkeleton />}
      >
        <DealsResults filters={filters} page={page} />
      </Suspense>
    </DealsShell>
  );
}

async function DealsResults({
  filters,
  page: requestedPage,
}: {
  filters: DealListFilters;
  page: number;
}) {
  const result = await getCachedDealsPage(filters, requestedPage);
  const { deals, total, page, pageSize, totalPages } = result;

  return (
    <>
      <p className="mb-8 text-sm text-zinc-500">
        {total} deal{total === 1 ? "" : "s"}
        {totalPages > 1 ? ` · page ${page} of ${totalPages}` : ""}
      </p>

      {deals.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-8 text-center text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          No deals match these filters. Try clearing filters, or run ingestion:{" "}
          <code className="font-mono text-sm">pnpm run cron</code> /{" "}
          <code className="font-mono text-sm">pnpm run cron-local</code>
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {deals.map((deal) => (
              <li key={deal.id}>
                <DealCard deal={deal} />
              </li>
            ))}
          </ul>

          <DealPagination
            filters={filters}
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
          />
        </div>
      )}
    </>
  );
}
