import { cacheLife, cacheTag } from "next/cache";

import type { DealListFilters } from "@/lib/deals/filters";
import type { GameOfferDetail } from "@/types/deal";

import {
  getGameOfferByGroupKey,
  listDealFilterOptions,
  listGameOffersPage,
  type GameOfferListPage,
} from "./deals";

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

export async function getCachedGameOfferByGroupKey(
  groupKey: string,
): Promise<GameOfferDetail | null> {
  "use cache";
  cacheTag("deals");
  cacheLife("hours");
  return getGameOfferByGroupKey(groupKey);
}
