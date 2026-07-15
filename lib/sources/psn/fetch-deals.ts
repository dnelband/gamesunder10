import type { NormalizedDeal } from "@/types/deal";

import {
  PSN_MAX_PRODUCTS,
  PSN_PAGE_SIZE,
  PSN_REQUEST_DELAY_MS,
} from "./config";
import { fetchPsnDealsPage } from "./graphql-client";
import { normalizePsnProduct } from "./normalize";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function fetchDeals(): Promise<NormalizedDeal[]> {
  const deals: NormalizedDeal[] = [];
  let offset = 0;

  while (offset < PSN_MAX_PRODUCTS) {
    const products = await fetchPsnDealsPage(offset, PSN_PAGE_SIZE);

    if (products.length === 0) {
      break;
    }

    for (const product of products) {
      const normalized = normalizePsnProduct(product);
      if (normalized) {
        deals.push(normalized);
      }
    }

    offset += products.length;

    if (products.length < PSN_PAGE_SIZE) {
      break;
    }

    await delay(PSN_REQUEST_DELAY_MS);
  }

  return deals;
}
