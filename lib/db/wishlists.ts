import { createHash, randomUUID } from "node:crypto";
import { and, eq, lte } from "drizzle-orm";

import { normalizeTitle } from "@/lib/deal-utils";
import {
  groupDealsIntoOffers,
  type DealForGrouping,
} from "@/lib/deals/grouping";
import type { RatingSource } from "@/types/deal";
import type { DealSource } from "@/types/deal-source";

import { db } from "./client";
import { deals, wishlists } from "./schema";

const MAX_PRICE_EUR = 10;

export interface WishlistItem {
  id: string;
  userId: string;
  igdbId: number;
  title: string;
  coverUrl: string | null;
  releaseDate: string | null;
  steamAppId: string | null;
  createdAt: string;
  lastNotifiedAt: string | null;
  lastNotifiedPriceEur: number | null;
}

export interface WishlistDealMatch {
  groupKey: string;
  minPriceEur: number;
  title: string;
}

export type WishlistItemInput = {
  igdbId: number;
  title: string;
  coverUrl?: string | null;
  releaseDate?: string | null;
  steamAppId?: string | null;
};

function rowToItem(row: typeof wishlists.$inferSelect): WishlistItem {
  return {
    id: row.id,
    userId: row.userId,
    igdbId: row.igdbId,
    title: row.title,
    coverUrl: row.coverUrl,
    releaseDate: row.releaseDate,
    steamAppId: row.steamAppId,
    createdAt: row.createdAt,
    lastNotifiedAt: row.lastNotifiedAt ?? null,
    lastNotifiedPriceEur: row.lastNotifiedPriceEur ?? null,
  };
}

const matchSelect = {
  id: deals.id,
  source: deals.source,
  title: deals.title,
  storeName: deals.storeName,
  steamAppId: deals.steamAppId,
  externalStoreUid: deals.externalStoreUid,
  priceEur: deals.priceEur,
  originalPriceEur: deals.originalPriceEur,
  url: deals.url,
  imageUrl: deals.imageUrl,
  sourceReleaseDate: deals.sourceReleaseDate,
  distributionFormat: deals.distributionFormat,
  genres: deals.genres,
  platforms: deals.platforms,
  rating: deals.rating,
  ratingSource: deals.ratingSource,
  normalizedTitle: deals.normalizedTitle,
} as const;

function toGroupingDeal(
  row: {
    id: string;
    source: string;
    title: string;
    storeName: string;
    steamAppId: string | null;
    externalStoreUid: string | null;
    priceEur: number;
    originalPriceEur: number;
    url: string;
    imageUrl: string | null;
    sourceReleaseDate: string | null;
    distributionFormat: string;
    genres: string[] | null;
    platforms: string[] | null;
    rating: number | null;
    ratingSource: string | null;
    normalizedTitle: string;
  },
): DealForGrouping {
  return {
    id: row.id,
    source: row.source as DealSource,
    title: row.title,
    storeName: row.storeName,
    steamAppId: row.steamAppId,
    externalStoreUid: row.externalStoreUid,
    priceEur: row.priceEur,
    originalPriceEur: row.originalPriceEur,
    url: row.url,
    imageUrl: row.imageUrl,
    sourceReleaseDate: row.sourceReleaseDate,
    distributionFormat:
      row.distributionFormat as DealForGrouping["distributionFormat"],
    genres: row.genres ?? [],
    platforms: row.platforms ?? [],
    rating: row.rating,
    ratingSource: row.ratingSource as RatingSource | null,
    normalizedTitle: row.normalizedTitle,
  };
}

export async function listWishlistItems(
  userId: string,
): Promise<WishlistItem[]> {
  const rows = await db
    .select()
    .from(wishlists)
    .where(eq(wishlists.userId, userId));

  return rows
    .map(rowToItem)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** All wishlist rows — cron notifier only. */
export async function listAllWishlistItems(): Promise<WishlistItem[]> {
  const rows = await db.select().from(wishlists);
  return rows.map(rowToItem);
}

export async function markWishlistNotified(
  id: string,
  priceEur: number,
): Promise<void> {
  await db
    .update(wishlists)
    .set({
      lastNotifiedAt: new Date().toISOString(),
      lastNotifiedPriceEur: priceEur,
    })
    .where(eq(wishlists.id, id));
}

export async function getWishlistItemByIgdbId(
  userId: string,
  igdbId: number,
): Promise<WishlistItem | null> {
  const rows = await db
    .select()
    .from(wishlists)
    .where(and(eq(wishlists.userId, userId), eq(wishlists.igdbId, igdbId)))
    .limit(1);

  return rows[0] ? rowToItem(rows[0]) : null;
}

/**
 * Wishlist is for games that do not yet appear as deals under €10.
 */
export async function findDealMatchForGame(input: {
  steamAppId?: string | null;
  title: string;
}): Promise<WishlistDealMatch | null> {
  const steamAppId =
    input.steamAppId && input.steamAppId !== "0" ? input.steamAppId : null;

  const listingRows = steamAppId
    ? await db
        .select(matchSelect)
        .from(deals)
        .where(and(eq(deals.steamAppId, steamAppId), lte(deals.priceEur, MAX_PRICE_EUR)))
    : await db
        .select(matchSelect)
        .from(deals)
        .where(
          and(
            eq(deals.normalizedTitle, normalizeTitle(input.title)),
            lte(deals.priceEur, MAX_PRICE_EUR),
          ),
        );

  if (listingRows.length === 0) {
    return null;
  }

  const offers = groupDealsIntoOffers(listingRows.map(toGroupingDeal));
  const lead = offers[0];
  if (!lead) {
    return null;
  }

  return {
    groupKey: lead.groupKey,
    minPriceEur: lead.minPriceEur,
    title: lead.title,
  };
}

export async function hasActiveDealForGame(input: {
  steamAppId?: string | null;
  title: string;
}): Promise<boolean> {
  return (await findDealMatchForGame(input)) !== null;
}

export async function addWishlistItem(
  userId: string,
  input: WishlistItemInput,
): Promise<{ ok: true; item: WishlistItem } | { ok: false; error: string }> {
  const existingDeal = await hasActiveDealForGame({
    steamAppId: input.steamAppId,
    title: input.title,
  });
  if (existingDeal) {
    return {
      ok: false,
      error: "This game already has a deal under €10 — browse deals instead.",
    };
  }

  const existing = await getWishlistItemByIgdbId(userId, input.igdbId);
  if (existing) {
    return { ok: true, item: existing };
  }

  const id =
    createHash("sha256")
      .update(`${userId}:${input.igdbId}`)
      .digest("hex")
      .slice(0, 32) || randomUUID();

  const [row] = await db
    .insert(wishlists)
    .values({
      id,
      userId,
      igdbId: input.igdbId,
      title: input.title.trim(),
      coverUrl: input.coverUrl ?? null,
      releaseDate: input.releaseDate ?? null,
      steamAppId: input.steamAppId ?? null,
    })
    .onConflictDoNothing()
    .returning();

  if (row) {
    return { ok: true, item: rowToItem(row) };
  }

  const again = await getWishlistItemByIgdbId(userId, input.igdbId);
  if (again) {
    return { ok: true, item: again };
  }

  return { ok: false, error: "Could not save wishlist item." };
}

export async function removeWishlistItem(
  userId: string,
  igdbId: number,
): Promise<void> {
  await db
    .delete(wishlists)
    .where(and(eq(wishlists.userId, userId), eq(wishlists.igdbId, igdbId)));
}

export async function findDealMatchesForWishlist(
  items: WishlistItem[],
): Promise<Record<number, WishlistDealMatch | null>> {
  const out: Record<number, WishlistDealMatch | null> = {};
  await Promise.all(
    items.map(async (item) => {
      out[item.igdbId] = await findDealMatchForGame({
        steamAppId: item.steamAppId,
        title: item.title,
      });
    }),
  );
  return out;
}
