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
import type { NormalizedDeal, RatingSource } from "@/types/deal";

import { db } from "./client";
import { deals } from "./schema";

const MAX_PRICE_EUR = 10;

export interface DealListPage {
  deals: NormalizedDeal[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
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

  const totalRows = await db
    .select({ total: count() })
    .from(deals)
    .where(where);
  const total = totalRows[0]?.total ?? 0;
  const totalPages = total === 0 ? 1 : Math.ceil(total / safePageSize);
  const safePage = Math.min(Math.max(1, page), totalPages);
  const offset = (safePage - 1) * safePageSize;

  const rows = await db
    .select()
    .from(deals)
    .where(where)
    .orderBy(
      desc(deals.originalPriceEur),
      sql`${deals.sourceReleaseDate} desc nulls last`,
    )
    .limit(safePageSize)
    .offset(offset);

  return {
    deals: rows.map(rowToDeal),
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
  const rows = await db
    .select({
      platforms: deals.platforms,
      genres: deals.genres,
    })
    .from(deals)
    .where(lte(deals.priceEur, MAX_PRICE_EUR));

  const platforms = new Set<string>();
  const genres = new Set<string>();

  for (const row of rows) {
    for (const platform of row.platforms ?? []) {
      platforms.add(platform);
    }
    for (const genre of row.genres ?? []) {
      genres.add(genre);
    }
  }

  return {
    platforms: [...platforms].sort(),
    genres: [...genres].sort(),
  };
}

export async function getDealById(id: string): Promise<NormalizedDeal | null> {
  const rows = await db.select().from(deals).where(eq(deals.id, id)).limit(1);
  const row = rows[0];
  return row ? rowToDeal(row) : null;
}
