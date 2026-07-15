import { desc, eq, lte, sql } from "drizzle-orm";

import type { NormalizedDeal, RatingSource } from "@/types/deal";

import { db } from "./client";
import { deals } from "./schema";

const MAX_PRICE_EUR = 10;

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

export async function listDeals(limit = 50): Promise<NormalizedDeal[]> {
  const rows = await db
    .select()
    .from(deals)
    .where(lte(deals.priceEur, MAX_PRICE_EUR))
    .orderBy(
      desc(deals.originalPriceEur),
      sql`${deals.sourceReleaseDate} desc nulls last`,
    )
    .limit(limit);

  return rows.map(rowToDeal);
}

export async function getDealById(id: string): Promise<NormalizedDeal | null> {
  const rows = await db.select().from(deals).where(eq(deals.id, id)).limit(1);
  const row = rows[0];
  return row ? rowToDeal(row) : null;
}
