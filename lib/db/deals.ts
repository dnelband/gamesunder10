import {
  and,
  arrayOverlaps,
  count,
  desc,
  eq,
  gte,
  ilike,
  lte,
  sql,
  type SQL,
} from "drizzle-orm";

import {
  DEFAULT_PAGE_SIZE,
  type DealListFilters,
} from "@/lib/deals/filters";
import type {
  DealListing,
  NormalizedDeal,
  RatingSource,
} from "@/types/deal";

import { db } from "./client";
import { deals } from "./schema";

const MAX_PRICE_EUR = 10;

const listingColumns = {
  id: deals.id,
  title: deals.title,
  storeName: deals.storeName,
  priceEur: deals.priceEur,
  originalPriceEur: deals.originalPriceEur,
  url: deals.url,
  imageUrl: deals.imageUrl,
  sourceReleaseDate: deals.sourceReleaseDate,
  genres: deals.genres,
  platforms: deals.platforms,
  rating: deals.rating,
  ratingSource: deals.ratingSource,
} as const;

export interface DealListPage {
  deals: DealListing[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function rowToListing(
  row: {
    id: string;
    title: string;
    storeName: string;
    priceEur: number;
    originalPriceEur: number;
    url: string;
    imageUrl: string | null;
    sourceReleaseDate: string | null;
    genres: string[] | null;
    platforms: string[] | null;
    rating: number | null;
    ratingSource: string | null;
  },
): DealListing {
  return {
    id: row.id,
    title: row.title,
    storeName: row.storeName,
    priceEur: row.priceEur,
    originalPriceEur: row.originalPriceEur,
    url: row.url,
    imageUrl: row.imageUrl,
    sourceReleaseDate: row.sourceReleaseDate,
    genres: row.genres ?? [],
    platforms: row.platforms ?? [],
    rating: row.rating,
    ratingSource: row.ratingSource as RatingSource | null,
  };
}

function rowToDeal(row: typeof deals.$inferSelect): NormalizedDeal {
  return {
    id: row.id,
    source: row.source as NormalizedDeal["source"],
    title: row.title,
    normalizedTitle: row.normalizedTitle,
    steamAppId: row.steamAppId,
    externalStoreUid: row.externalStoreUid,
    storeName: row.storeName,
    priceEur: row.priceEur,
    originalPriceEur: row.originalPriceEur,
    discountPercent: row.discountPercent,
    currencyOriginal: row.currencyOriginal,
    url: row.url,
    imageUrl: row.imageUrl,
    region: row.region,
    sourceReleaseDate: row.sourceReleaseDate,
    genres: row.genres ?? [],
    platforms: row.platforms ?? [],
    rating: row.rating,
    ratingSource: row.ratingSource as RatingSource | null,
    description: row.description,
    coverUrl: row.coverUrl,
    screenshotUrls: row.screenshotUrls ?? [],
    fetchedAt: row.fetchedAt,
  };
}

function buildDealFilters(filters: DealListFilters): SQL[] {
  const conditions: SQL[] = [lte(deals.priceEur, MAX_PRICE_EUR)];

  if (filters.q) {
    conditions.push(ilike(deals.title, `%${filters.q}%`));
  }

  if (filters.platforms.length > 0) {
    conditions.push(arrayOverlaps(deals.platforms, filters.platforms));
  }

  if (filters.genres.length > 0) {
    conditions.push(arrayOverlaps(deals.genres, filters.genres));
  }

  if (filters.minRating !== null) {
    conditions.push(gte(deals.rating, filters.minRating));
  }

  return conditions;
}

export async function upsertDeals(items: NormalizedDeal[]): Promise<number> {
  if (items.length === 0) {
    return 0;
  }

  for (const item of items) {
    await db
      .insert(deals)
      .values({
        id: item.id,
        source: item.source,
        title: item.title,
        normalizedTitle: item.normalizedTitle,
        steamAppId: item.steamAppId,
        externalStoreUid: item.externalStoreUid,
        storeName: item.storeName,
        priceEur: item.priceEur,
        originalPriceEur: item.originalPriceEur,
        discountPercent: item.discountPercent,
        currencyOriginal: item.currencyOriginal,
        url: item.url,
        imageUrl: item.imageUrl,
        region: item.region,
        sourceReleaseDate: item.sourceReleaseDate,
        genres: item.genres,
        platforms: item.platforms,
        rating: item.rating,
        ratingSource: item.ratingSource,
        description: item.description,
        coverUrl: item.coverUrl,
        screenshotUrls: item.screenshotUrls,
        fetchedAt: item.fetchedAt,
      })
      .onConflictDoUpdate({
        target: deals.id,
        set: {
          title: item.title,
          normalizedTitle: item.normalizedTitle,
          steamAppId: item.steamAppId,
          externalStoreUid: item.externalStoreUid,
          storeName: item.storeName,
          priceEur: item.priceEur,
          originalPriceEur: item.originalPriceEur,
          discountPercent: item.discountPercent,
          currencyOriginal: item.currencyOriginal,
          url: item.url,
          imageUrl: item.imageUrl,
          region: item.region,
          sourceReleaseDate: item.sourceReleaseDate,
          genres: item.genres,
          platforms: item.platforms,
          rating: item.rating,
          ratingSource: item.ratingSource,
          description: item.description,
          coverUrl: item.coverUrl,
          screenshotUrls: item.screenshotUrls,
          fetchedAt: item.fetchedAt,
        },
      });
  }

  return items.length;
}

export async function listDealsPage(
  filters: DealListFilters = {
    q: "",
    platforms: [],
    genres: [],
    minRating: null,
  },
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<DealListPage> {
  const safePageSize = Math.max(1, Math.min(pageSize, 100));
  const where = and(...buildDealFilters(filters));
  const requestedPage = Math.max(1, page);
  const offset = (requestedPage - 1) * safePageSize;

  const orderBy = [
    desc(deals.originalPriceEur),
    sql`${deals.sourceReleaseDate} desc nulls last`,
  ] as const;

  const [totalRows, rows] = await Promise.all([
    db.select({ total: count() }).from(deals).where(where),
    db
      .select(listingColumns)
      .from(deals)
      .where(where)
      .orderBy(...orderBy)
      .limit(safePageSize)
      .offset(offset),
  ]);

  const total = totalRows[0]?.total ?? 0;
  const totalPages = total === 0 ? 1 : Math.ceil(total / safePageSize);
  const safePage = Math.min(requestedPage, totalPages);

  if (total > 0 && requestedPage > totalPages) {
    const correctedRows = await db
      .select(listingColumns)
      .from(deals)
      .where(where)
      .orderBy(...orderBy)
      .limit(safePageSize)
      .offset((safePage - 1) * safePageSize);

    return {
      deals: correctedRows.map(rowToListing),
      total,
      page: safePage,
      pageSize: safePageSize,
      totalPages,
    };
  }

  return {
    deals: rows.map(rowToListing),
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages,
  };
}

export async function listDealFilterOptions(): Promise<{
  platforms: string[];
  genres: string[];
}> {
  const [platformRows, genreRows] = await Promise.all([
    db.execute<{ value: string }>(sql`
      SELECT DISTINCT unnest(${deals.platforms}) AS value
      FROM ${deals}
      WHERE ${deals.priceEur} <= ${MAX_PRICE_EUR}
      ORDER BY 1
    `),
    db.execute<{ value: string }>(sql`
      SELECT DISTINCT unnest(${deals.genres}) AS value
      FROM ${deals}
      WHERE ${deals.priceEur} <= ${MAX_PRICE_EUR}
      ORDER BY 1
    `),
  ]);

  return {
    platforms: platformRows.map((row) => row.value).filter(Boolean),
    genres: genreRows.map((row) => row.value).filter(Boolean),
  };
}

export async function getDealById(id: string): Promise<NormalizedDeal | null> {
  const rows = await db.select().from(deals).where(eq(deals.id, id)).limit(1);
  const row = rows[0];
  return row ? rowToDeal(row) : null;
}
