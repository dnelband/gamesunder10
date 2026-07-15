import { cacheLife, cacheTag } from "next/cache";

import type { NormalizedDeal } from "@/types/deal";

import { getDealById, listDeals } from "./deals";

export async function getCachedDeals(limit = 50): Promise<NormalizedDeal[]> {
  "use cache";
  cacheTag("deals");
  cacheLife("hours");
  return listDeals(limit);
}

export async function getCachedDealById(
  id: string,
): Promise<NormalizedDeal | null> {
  "use cache";
  cacheTag("deals");
  cacheLife("hours");
  return getDealById(id);
}
