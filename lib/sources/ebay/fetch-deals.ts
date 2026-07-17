import type { NormalizedDeal } from "@/types/deal";

import { fetchEbayItemSummaries } from "./browse-client";
import { normalizeEbayItem } from "./normalize";

export async function fetchDeals(): Promise<NormalizedDeal[]> {
  const items = await fetchEbayItemSummaries();
  const deals: NormalizedDeal[] = [];

  for (const item of items) {
    const normalized = normalizeEbayItem(item);
    if (normalized) {
      deals.push(normalized);
    }
  }

  return deals;
}
