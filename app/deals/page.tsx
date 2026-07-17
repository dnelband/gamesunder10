import { connection } from "next/server";
import { Suspense } from "react";

import { BrandWordmark } from "@/components/brand-wordmark";
import {
  getCachedDealFilterOptions,
  getCachedGameOffersPage,
} from "@/lib/db/deals-cached";
import {
  parseDealFilters,
  parsePage,
  type DealListFilters,
} from "@/lib/deals/filters";

import { GameOfferCard } from "./game-offer-card";
import { DealPagination } from "./deal-pagination";
import {
  DealFiltersSkeleton,
  DealsGridSkeleton,
  DealsSummarySkeleton,
} from "./deals-grid-skeleton";
import { DealsShell } from "./deals-shell";
import { EmptyDealsMessage } from "./empty-deals-message";

function DealsPageFallback() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <DealFiltersSkeleton />
        <DealsSummarySkeleton />
      </div>
      <DealsGridSkeleton />
    </div>
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
      <header>
        <BrandWordmark size="lg" />
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
  const key = resultsKey(filters, page);

  return (
    <DealsShell
      initialFilters={filters}
      availableGenres={filterOptions.genres}
      availablePlatforms={filterOptions.platforms}
      summary={
        <Suspense key={key} fallback={<DealsSummarySkeleton />}>
          <DealsSummary filters={filters} page={page} />
        </Suspense>
      }
    >
      <Suspense key={key} fallback={<DealsGridSkeleton />}>
        <DealsResults filters={filters} page={page} />
      </Suspense>
    </DealsShell>
  );
}

async function DealsSummary({
  filters,
  page: requestedPage,
}: {
  filters: DealListFilters;
  page: number;
}) {
  const { total, page, totalPages } = await getCachedGameOffersPage(
    filters,
    requestedPage,
  );

  return (
    <>
      {total} game{total === 1 ? "" : "s"}
      {totalPages > 1 ? ` · page ${page} of ${totalPages}` : ""}
    </>
  );
}

async function DealsResults({
  filters,
  page: requestedPage,
}: {
  filters: DealListFilters;
  page: number;
}) {
  const result = await getCachedGameOffersPage(filters, requestedPage);
  const { games, total, page, pageSize, totalPages } = result;

  if (games.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-stroke bg-surface px-4 py-10 text-center">
        <EmptyDealsMessage />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {games.map((game) => (
          <li key={game.groupKey}>
            <GameOfferCard game={game} />
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
  );
}
