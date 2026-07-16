import { cacheLife, cacheTag } from "next/cache";

import type { DealListFilters } from "@/lib/deals/filters";
import type { NormalizedDeal } from "@/types/deal";

import {
  getDealById,
  listDealFilterOptions,
  listDealsPage,
  type DealListPage,
} from "./deals";

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
