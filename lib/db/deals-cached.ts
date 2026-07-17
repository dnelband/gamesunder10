import { cacheLife, cacheTag } from "next/cache";

import type { DealListFilters } from "@/lib/deals/filters";
import type { NormalizedDeal } from "@/types/deal";

import {
  getDealById,
  getGameOfferByGroupKey,
  listDealFilterOptions,
  listDealsPage,
  listGameOffersPage,
  type DealListPage,
  type GameOfferListPage,
} from "./deals";
import type { GameOfferDetail } from "@/types/deal";

export async function getCachedDealsPage(
  filters: DealListFilters,
  page: number,
  pageSize?: number,
): Promise<DealListPage> {
  "use cache";
  cacheTag("deals");
  cacheLife("hours");
  return listDealsPage(filters, page, pageSize);
}

export async function getCachedGameOffersPage(
  filters: DealListFilters,
  page: number,
  pageSize?: number,
): Promise<GameOfferListPage> {
  "use cache";
  cacheTag("deals");
  cacheLife("hours");
  return listGameOffersPage(filters, page, pageSize);
}

export async function getCachedDealFilterOptions(): Promise<{
  platforms: string[];
  genres: string[];
}> {
  "use cache";
  cacheTag("deals");
  cacheLife("hours");
  return listDealFilterOptions();
}

export async function getCachedDealById(
  id: string,
): Promise<NormalizedDeal | null> {
  "use cache";
  cacheTag("deals");
  cacheLife("hours");
  return getDealById(id);
}

export async function getCachedGameOfferByGroupKey(
  groupKey: string,
): Promise<GameOfferDetail | null> {
  "use cache";
  cacheTag("deals");
  cacheLife("hours");
  return getGameOfferByGroupKey(groupKey);
}
