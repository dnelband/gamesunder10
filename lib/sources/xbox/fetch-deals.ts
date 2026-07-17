import type { NormalizedDeal } from "@/types/deal";

import { fetchXboxBrowsePage } from "./catalog-client";
import {
  XBOX_MAX_PAGES,
  XBOX_PAGE_SIZE,
  XBOX_REQUEST_DELAY_MS,
} from "./config";
import { normalizeXboxProduct } from "./normalize";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function maxPagesForCatalog(totalItems: number | null): number {
  if (totalItems == null || totalItems <= 0) {
    return XBOX_MAX_PAGES;
  }
  return Math.min(XBOX_MAX_PAGES, Math.ceil(totalItems / XBOX_PAGE_SIZE));
}

export async function fetchDeals(): Promise<NormalizedDeal[]> {
  const deals: NormalizedDeal[] = [];
  const seenProductIds = new Set<string>();
  let maxPages = XBOX_MAX_PAGES;

  for (let page = 1; page <= maxPages; page += 1) {
    const { summaries, totalItems } = await fetchXboxBrowsePage(
      page,
      XBOX_PAGE_SIZE,
    );

    if (page === 1 && totalItems != null) {
      maxPages = maxPagesForCatalog(totalItems);
    }

    if (summaries.length === 0) {
      break;
    }

    for (const product of summaries) {
      if (seenProductIds.has(product.productId)) {
        continue;
      }

      const normalized = normalizeXboxProduct(product);
      if (normalized) {
        seenProductIds.add(product.productId);
        deals.push(normalized);
      }
    }

    if (summaries.length < XBOX_PAGE_SIZE) {
      break;
    }

    if (page < maxPages) {
      await delay(XBOX_REQUEST_DELAY_MS);
    }
  }

  return deals;
}
