import type { StoreUrlKind } from "@/lib/sources/cheapshark/store-url-kinds";

/**
 * Single registry for CheapShark storeID → product / search capability.
 * Keep store names aligned with CheapShark's `/stores` API (as stored on deals).
 */
export interface CheapsharkStoreBuilder {
  /** Canonical name as CheapShark reports it (matches deals.store_name). */
  name: string;
  /**
   * Product deep-link strategy:
   * - `steamAppId` — product when deal has steamAppID (else search)
   * - title→slug strategies — product from title
   * - `false` — no product path; use search (often because of unknowable store id)
   */
  product:
    | false
    | "steamAppId"
    | "titleHyphenEpic"
    | "titleUnderscoreGog"
    | "titleHyphenGmg"
    | "titleHyphenGamersGate"
    | "titleHyphenHumble"
    | "titleHyphenFanatical"
    | "titleHyphenGameBillet";
  /** Store has a title search URL (fallback when product is impossible). */
  search: boolean;
  /**
   * Product path needs a store-native id CheapShark does not provide
   * (e.g. WinGameStore `/product/{numericId}/…`).
   */
  needsUnknowableId?: boolean;
}

export const CHEAPSHARK_STORE_BUILDERS: Record<string, CheapsharkStoreBuilder> =
  {
    "1": { name: "Steam", product: "steamAppId", search: true },
    "2": { name: "GamersGate", product: "titleHyphenGamersGate", search: true },
    "3": { name: "GreenManGaming", product: "titleHyphenGmg", search: true },
    "7": { name: "GOG", product: "titleUnderscoreGog", search: true },
    "11": { name: "Humble Store", product: "titleHyphenHumble", search: true },
    "13": { name: "Uplay", product: false, search: true },
    "15": { name: "Fanatical", product: "titleHyphenFanatical", search: true },
    "21": {
      name: "WinGameStore",
      product: false,
      search: true,
      needsUnknowableId: true,
    },
    "23": {
      name: "GameBillet",
      product: "titleHyphenGameBillet",
      search: true,
    },
    "25": { name: "Epic Games Store", product: "titleHyphenEpic", search: true },
    "27": { name: "Gamesplanet", product: false, search: true },
    "30": { name: "IndieGala", product: false, search: true },
  };

const BY_NAME = new Map(
  Object.entries(CHEAPSHARK_STORE_BUILDERS).map(([id, entry]) => [
    entry.name.toLowerCase(),
    { storeId: id, ...entry },
  ]),
);

const PRODUCT_DETAIL: Record<
  Exclude<CheapsharkStoreBuilder["product"], false>,
  string
> = {
  steamAppId: "Steam /app/{steamAppId}; search if missing",
  titleHyphenEpic: "Epic /p/{title slug}; editions use --",
  titleUnderscoreGog: "GOG /en/game/{underscore slug}",
  titleHyphenGmg: "GMG /games/{hyphen slug}/",
  titleHyphenGamersGate: "GamersGate /product/{hyphen slug}/",
  titleHyphenHumble: "Humble /store/{hyphen slug}",
  titleHyphenFanatical: "Fanatical /en/game/{hyphen slug}",
  titleHyphenGameBillet: "GameBillet /{hyphen slug}",
};

export type LinkBuilderStatus = {
  kind: StoreUrlKind;
  /** Short label for the table. */
  label: string;
  detail: string;
};

export function linkBuilderStatusForStore(input: {
  source: string;
  storeName: string;
}): LinkBuilderStatus {
  if (input.source === "psn") {
    return {
      kind: "product",
      label: "product",
      detail: "PlayStation Store product id",
    };
  }
  if (input.source === "xbox") {
    return {
      kind: "product",
      label: "product",
      detail: "Xbox /games/store/{title-slug}/{productId}",
    };
  }
  if (input.source === "ebay") {
    return {
      kind: "product",
      label: "product",
      detail: "eBay item URL from Browse API",
    };
  }

  if (input.source === "cheapshark") {
    const entry = BY_NAME.get(input.storeName.toLowerCase());
    if (!entry) {
      return {
        kind: "omit",
        label: "omit",
        detail: "Unknown store — no product or search template",
      };
    }
    if (entry.product) {
      return {
        kind: "product",
        label: "product",
        detail: PRODUCT_DETAIL[entry.product],
      };
    }
    if (entry.search) {
      return {
        kind: "search",
        label: "search",
        detail: entry.needsUnknowableId
          ? `Product needs store id we lack — search fallback (storeID ${entry.storeId})`
          : `No product builder yet — search fallback (storeID ${entry.storeId})`,
      };
    }
    return {
      kind: "omit",
      label: "omit",
      detail: `storeID ${entry.storeId} — no product or search`,
    };
  }

  return {
    kind: "omit",
    label: "omit",
    detail: `No builder policy for source ${input.source}`,
  };
}

export function cheapsharkStoreIdByName(storeName: string): string | null {
  return BY_NAME.get(storeName.toLowerCase())?.storeId ?? null;
}
