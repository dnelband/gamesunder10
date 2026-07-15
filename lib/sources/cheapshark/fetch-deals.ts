import {
  cheapsharkDealsResponseSchema,
  cheapsharkStoresResponseSchema,
} from "./schema";
import { normalizeCheapsharkDeal } from "./normalize";
import {
  delayBetweenRequests,
  fetchCheapsharkWithRetry,
} from "./http";
import type { NormalizedDeal } from "@/types/deal";

const CHEAPSHARK_API = "https://www.cheapshark.com/api/1.0";
const MAX_PAGES = 10;
const PAGE_SIZE = 60;
const PAGE_DELAY_MS = 400;

async function fetchStoreNames(): Promise<Map<string, string>> {
  const response = await fetchCheapsharkWithRetry(`${CHEAPSHARK_API}/stores`, {
    label: "stores",
  });

  const json: unknown = await response.json();
  const stores = cheapsharkStoresResponseSchema.parse(json);

  return new Map(stores.map((store) => [store.storeID, store.storeName]));
}

export async function fetchDeals(): Promise<NormalizedDeal[]> {
  const storeNames = await fetchStoreNames();
  const deals: NormalizedDeal[] = [];

  for (let page = 0; page < MAX_PAGES; page += 1) {
    if (page > 0) {
      await delayBetweenRequests(PAGE_DELAY_MS);
    }

    const url = new URL(`${CHEAPSHARK_API}/deals`);
    url.searchParams.set("upperPrice", "15");
    url.searchParams.set("pageNumber", String(page));
    url.searchParams.set("pageSize", String(PAGE_SIZE));

    const response = await fetchCheapsharkWithRetry(url, {
      label: `deals page ${page}`,
    });

    const json: unknown = await response.json();
    const pageDeals = cheapsharkDealsResponseSchema.parse(json);

    if (pageDeals.length === 0) {
      break;
    }

    for (const deal of pageDeals) {
      const normalized = normalizeCheapsharkDeal(deal, storeNames);
      if (normalized) {
        deals.push(normalized);
      }
    }

    if (pageDeals.length < PAGE_SIZE) {
      break;
    }
  }

  return deals;
}
