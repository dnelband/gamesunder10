import { connection } from "next/server";
import { Suspense } from "react";

import {
  getCachedDealFilterOptions,
  getCachedDealsPage,
} from "@/lib/db/deals-cached";
import { parseDealFilters, parsePage } from "@/lib/deals/filters";

import { DealCard } from "./deal-card";
import { DealFilters } from "./deal-filters";
import { DealPagination } from "./deal-pagination";

function DealsFallback() {
  return (
    <div className="mx-auto px-6 py-12 text-zinc-600 dark:text-zinc-400">
      Loading deals…
    </div>
  );
}

export default function DealsPage(props: PageProps<"/deals">) {
  return (
    <Suspense fallback={<DealsFallback />}>
      <DealsContent {...props} />
    </Suspense>
  );
}

async function DealsContent(props: PageProps<"/deals">) {
  await connection();
  const searchParams = await props.searchParams;
  const filters = parseDealFilters(searchParams);
  const requestedPage = parsePage(searchParams);

  const [result, filterOptions] = await Promise.all([
    getCachedDealsPage(filters, requestedPage),
    getCachedDealFilterOptions(),
  ]);

  const { deals, total, page, pageSize, totalPages } = result;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Deals under €10</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Sorted by original price (highest first), then release date (newest
          first). {total} deal{total === 1 ? "" : "s"}
          {totalPages > 1 ? ` · page ${page} of ${totalPages}` : ""}.
        </p>
      </header>

      <DealFilters
        key={[
          filters.q,
          filters.platforms.join(","),
          filters.genres.join(","),
          filters.minRating ?? "",
        ].join("|")}
        initialFilters={filters}
        availableGenres={filterOptions.genres}
        availablePlatforms={filterOptions.platforms}
      />

      {deals.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-8 text-center text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          No deals match these filters. Try clearing filters, or run ingestion:{" "}
          <code className="font-mono text-sm">pnpm run cron</code> /{" "}
          <code className="font-mono text-sm">pnpm run cron-local</code>
        </p>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
