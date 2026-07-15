export const PSN_GRAPHQL_URL =
  "https://web.np.playstation.com/api/graphql/v1/op";

/** Deals category on the PS Store (same UUID for NL/GB as of 2026-07). */
export const DEFAULT_PSN_DEALS_CATEGORY_ID =
  "3f772501-f6f8-49b7-abac-874a88ca4897";

/**
 * Persisted query hash for `categoryGridRetrieve`. If the API starts returning
 * PersistedQueryNotFound, capture a fresh hash from the store's network tab.
 */
export const DEFAULT_PSN_GRAPHQL_HASH =
  "4ce7d410a4db2c8b635a48c1dcec375906ff63b19dadd87e073f8fd0c0481d35";

export const PSN_PAGE_SIZE = 50;
export const PSN_MAX_PRODUCTS = 1000;
export const PSN_REQUEST_DELAY_MS = 300;

export function getPsnLocale(): string {
  return process.env.PSN_LOCALE ?? "de-DE";
}

export function getPsnStorePath(): string {
  return process.env.PSN_STORE_PATH ?? "de-de";
}

export function getPsnRegion(): string {
  if (process.env.PSN_REGION) {
    return process.env.PSN_REGION;
  }

  const locale = getPsnLocale();
  const region = locale.split("-")[1];
  return region ? region.toUpperCase() : locale.toUpperCase();
}

/** IGDB `external_game_sources` id for PlayStation Store listings. */
export function getIgdbPsnExternalGameSource(): number {
  const configured = process.env.IGDB_PSN_EXTERNAL_GAME_SOURCE;
  if (configured) {
    return Number.parseInt(configured, 10);
  }
  return 36;
}

export function getPsnDealsCategoryId(): string {
  return process.env.PSN_DEALS_CATEGORY_ID ?? DEFAULT_PSN_DEALS_CATEGORY_ID;
}

export function getPsnGraphqlHash(): string {
  return process.env.PSN_GRAPHQL_HASH ?? DEFAULT_PSN_GRAPHQL_HASH;
}
