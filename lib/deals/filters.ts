import {
  FILTER_PLATFORMS,
  type FilterPlatform,
} from "@/lib/deals/platforms";
import { effectiveSearchQuery } from "@/lib/search-query";

export { FILTER_PLATFORMS };

export interface DealListFilters {
  q: string;
  platforms: string[];
  genres: string[];
  minRating: number | null;
  /** Exact `deals.store_name` match (from /admin/stores deep links). */
  store: string | null;
}

function isFilterPlatform(platform: string): platform is FilterPlatform {
  return (FILTER_PLATFORMS as readonly string[]).includes(platform);
}

function asStringArray(value: string | string[] | undefined): string[] {
  if (!value) {
    return [];
  }
  const parts = Array.isArray(value) ? value : value.split(",");
  return [
    ...new Set(
      parts
        .map((part) => part.trim())
        .filter((part) => part.length > 0),
    ),
  ].sort();
}

export function parseDealFilters(
  searchParams: Record<string, string | string[] | undefined>,
): DealListFilters {
  const qRaw = searchParams.q;
  const q = effectiveSearchQuery(
    Array.isArray(qRaw) ? qRaw[0] : qRaw,
  );

  const platforms = asStringArray(searchParams.platform).filter(isFilterPlatform);

  const genres = asStringArray(searchParams.genre);

  const minRatingRaw = Array.isArray(searchParams.minRating)
    ? searchParams.minRating[0]
    : searchParams.minRating;
  const minRatingParsed = minRatingRaw
    ? Number.parseFloat(minRatingRaw)
    : Number.NaN;
  const minRating =
    Number.isFinite(minRatingParsed) && minRatingParsed > 0
      ? minRatingParsed
      : null;

  const storeRaw = Array.isArray(searchParams.store)
    ? searchParams.store[0]
    : searchParams.store;
  const store = storeRaw?.trim() || null;

  return { q, platforms, genres, minRating, store };
}

export function countActiveFilters(filters: DealListFilters): number {
  let count = 0;
  if (filters.q) count += 1;
  if (filters.platforms.length > 0) count += 1;
  if (filters.genres.length > 0) count += 1;
  if (filters.minRating !== null) count += 1;
  if (filters.store) count += 1;
  return count;
}

export const DEFAULT_PAGE_SIZE = 24;

export function parsePage(
  searchParams: Record<string, string | string[] | undefined>,
): number {
  const raw = Array.isArray(searchParams.page)
    ? searchParams.page[0]
    : searchParams.page;
  const page = raw ? Number.parseInt(raw, 10) : 1;
  if (!Number.isFinite(page) || page < 1) {
    return 1;
  }
  return page;
}

export function filtersToSearchParams(
  filters: DealListFilters,
  page = 1,
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q) {
    params.set("q", filters.q);
  }
  for (const platform of filters.platforms) {
    params.append("platform", platform);
  }
  for (const genre of filters.genres) {
    params.append("genre", genre);
  }
  if (filters.minRating !== null) {
    params.set("minRating", String(filters.minRating));
  }
  if (filters.store) {
    params.set("store", filters.store);
  }
  if (page > 1) {
    params.set("page", String(page));
  }
  return params;
}

/** Deep-link from /admin/stores into the deals listing. */
export function dealsHrefForStore(storeName: string): string {
  const params = filtersToSearchParams({
    q: "",
    platforms: [],
    genres: [],
    minRating: null,
    store: storeName,
  });
  return `/deals?${params.toString()}`;
}
