import {
  EBAY_MARKETPLACE_ID,
  EBAY_MAX_PAGES,
  EBAY_MAX_PRICE_EUR,
  EBAY_PAGE_SIZE,
  EBAY_REQUEST_DELAY_MS,
  getEbayCategoryId,
} from "./config";
import { getEbayAccessToken } from "./auth";
import {
  ebaySearchResponseSchema,
  type EbayItemSummary,
} from "./schema";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function buildSearchUrl(offset: number): string {
  const categoryId = getEbayCategoryId();
  const filter = [
    `price:[0.5..${EBAY_MAX_PRICE_EUR}]`,
    "priceCurrency:EUR",
    "buyingOptions:{FIXED_PRICE}",
    "deliveryCountry:DE",
  ].join(",");

  const params = new URLSearchParams({
    category_ids: categoryId,
    limit: String(EBAY_PAGE_SIZE),
    offset: String(offset),
    filter,
    sort: "price",
  });

  return `https://api.ebay.com/buy/browse/v1/item_summary/search?${params}`;
}

export async function fetchEbaySearchPage(
  offset: number,
): Promise<{ items: EbayItemSummary[]; total: number }> {
  const token = await getEbayAccessToken();
  const response = await fetch(buildSearchUrl(offset), {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-EBAY-C-MARKETPLACE-ID": EBAY_MARKETPLACE_ID,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`eBay Browse search failed (${response.status}): ${body}`);
  }

  const json: unknown = await response.json();
  const parsed = ebaySearchResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error(
      `eBay Browse response failed validation: ${parsed.error.message}`,
    );
  }

  return {
    items: parsed.data.itemSummaries ?? [],
    total: parsed.data.total ?? 0,
  };
}

/** Paginate Buy It Now listings under €10 in the Videospiele category (DE). */
export async function fetchEbayItemSummaries(): Promise<EbayItemSummary[]> {
  const items: EbayItemSummary[] = [];
  let offset = 0;

  for (let page = 0; page < EBAY_MAX_PAGES; page += 1) {
    const { items: batch, total } = await fetchEbaySearchPage(offset);

    if (batch.length === 0) {
      break;
    }

    items.push(...batch);
    offset += batch.length;

    if (offset >= total || batch.length < EBAY_PAGE_SIZE) {
      break;
    }

    await delay(EBAY_REQUEST_DELAY_MS);
  }

  return items;
}
