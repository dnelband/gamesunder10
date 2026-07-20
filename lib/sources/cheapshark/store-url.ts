/**
 * CheapShark store URLs — case-by-case builders.
 *
 * Policy:
 * 1. Prefer a **product** deep link when the pattern is known
 *    (Steam app id, proven title→slug stores).
 * 2. If product is impossible because we lack an unknowable store id
 *    (or have no product builder yet), fall back to that store's **search**.
 * 3. Never emit CheapShark redirects or DDG as the normal CTA.
 * 4. URLs are resolved at render time; ingest may leave `url` empty for CS.
 */

import type { StoreUrlKind } from "./store-url-kinds";
import { cheapsharkStoreIdByName } from "./store-registry";

export type { StoreUrlKind };

export interface StoreUrlResult {
  url: string;
  kind: Exclude<StoreUrlKind, "omit">;
  /** CheapShark storeID */
  storeId: string;
}

function validSteamAppId(value: string | null | undefined): string | null {
  if (!value || value === "0") {
    return null;
  }
  return value;
}

/** Epic / many stores: lowercase, spaces→`-`, strip punctuation. */
export function titleToHyphenSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Epic editions often use a double-hyphen before the edition segment:
 * `game-name--digital-deluxe-edition`
 */
export function titleToEpicSlug(title: string): string {
  const editionMatch = title.match(
    /^(.+?)[\s:]*[(\[]?(digital\s+deluxe(?:\s+edition)?|deluxe\s+edition|gold\s+edition|ultimate\s+edition|standard\s+edition|game\s+of\s+the\s+year(?:\s+edition)?|goty)[)\]]?\s*$/i,
  );

  if (editionMatch) {
    const base = titleToHyphenSlug(editionMatch[1]);
    const edition = titleToHyphenSlug(editionMatch[2]);
    if (base && edition) {
      return `${base}--${edition}`;
    }
  }

  return titleToHyphenSlug(title);
}

/**
 * GOG: `/en/game/{slug}` — spaces→`_`, strip punctuation, drop hyphens
 * inside words (`Middle-earth` → `middleearth`).
 */
export function titleToGogSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/-/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

/** GMG: underscores in titles become word breaks (`Watch_Dogs` → `watch-dogs`). */
export function titleToGmgSlug(title: string): string {
  return titleToHyphenSlug(title.replace(/_/g, " "));
}

export interface CheapsharkUrlInput {
  storeId?: string | null;
  storeName?: string | null;
  title: string;
  steamAppId?: string | null;
}

function resolveStoreId(input: CheapsharkUrlInput): string | null {
  return (
    input.storeId?.trim() ||
    (input.storeName ? cheapsharkStoreIdByName(input.storeName) : null)
  );
}

type ProductUrlBuilder = (input: CheapsharkUrlInput) => string | null;

/** One builder per CheapShark storeID — keeps each store's slug rule isolated. */
const PRODUCT_URL_BUILDERS: Record<string, ProductUrlBuilder> = {
  "1": (input) => {
    const steamAppId = validSteamAppId(input.steamAppId);
    return steamAppId
      ? `https://store.steampowered.com/app/${steamAppId}`
      : null;
  },
  "2": (input) => {
    const slug = titleToHyphenSlug(input.title);
    return slug ? `https://www.gamersgate.com/product/${slug}/` : null;
  },
  "3": (input) => {
    const slug = titleToGmgSlug(input.title);
    return slug ? `https://www.greenmangaming.com/games/${slug}/` : null;
  },
  "7": (input) => {
    const slug = titleToGogSlug(input.title);
    return slug ? `https://www.gog.com/en/game/${slug}` : null;
  },
  // Humble Store
  "11": (input) => {
    const slug = titleToHyphenSlug(input.title);
    return slug ? `https://www.humblebundle.com/store/${slug}` : null;
  },
  // Fanatical
  "15": (input) => {
    const slug = titleToHyphenSlug(input.title);
    return slug ? `https://www.fanatical.com/en/game/${slug}` : null;
  },
  // GameBillet — root path slug (not /games/…)
  "23": (input) => {
    const slug = titleToHyphenSlug(input.title);
    return slug ? `https://www.gamebillet.com/${slug}` : null;
  },
  "25": (input) => {
    const slug = titleToEpicSlug(input.title);
    return slug ? `https://store.epicgames.com/p/${slug}?lang=de` : null;
  },
};

/**
 * Build a product URL for a CheapShark store deal, or null if we cannot.
 */
export function buildCheapsharkProductUrl(
  input: CheapsharkUrlInput,
): StoreUrlResult | null {
  const storeId = resolveStoreId(input);
  if (!storeId) {
    return null;
  }

  const url = PRODUCT_URL_BUILDERS[storeId]?.(input);
  return url ? { storeId, kind: "product", url } : null;
}

/** One builder per CheapShark storeID for the search fallback path. */
const SEARCH_URL_BUILDERS: Record<string, (query: string) => string> = {
  "1": (query) => `https://store.steampowered.com/search/?term=${query}`,
  "2": (query) => `https://www.gamersgate.com/games?query=${query}`,
  "3": (query) => `https://www.greenmangaming.com/search?query=${query}`,
  "7": (query) => `https://www.gog.com/en/games?query=${query}`,
  "11": (query) =>
    `https://www.humblebundle.com/store/search?search=${query}`,
  "13": (query) => `https://store.ubisoft.com/de/search?q=${query}`,
  "15": (query) => `https://www.fanatical.com/en/search?search=${query}`,
  // WinGameStore product URLs need a numeric id CheapShark does not provide.
  "21": (query) => `https://www.wingamestore.com/search/?Search=${query}`,
  "23": (query) => `https://www.gamebillet.com/search?q=${query}`,
  "25": (query) =>
    `https://store.epicgames.com/browse?q=${query}&sortBy=relevancy&sortDir=DESC&count=40&lang=de`,
  "27": (query) => `https://www.gamesplanet.com/search?query=${query}`,
  "30": (query) => `https://www.indiegala.com/store/search?q=${query}`,
};

/**
 * Store search fallback — used when product needs an unknowable id
 * (or we have no product builder yet).
 */
export function buildCheapsharkSearchUrl(
  input: CheapsharkUrlInput,
): StoreUrlResult | null {
  const storeId = resolveStoreId(input);
  if (!storeId) {
    return null;
  }

  const builder = SEARCH_URL_BUILDERS[storeId];
  if (!builder) {
    return null;
  }

  return {
    storeId,
    kind: "search",
    url: builder(encodeURIComponent(input.title)),
  };
}

/** Product first, then store search. Never DDG. */
export function buildCheapsharkOfferUrl(
  input: CheapsharkUrlInput,
): StoreUrlResult | null {
  return buildCheapsharkProductUrl(input) ?? buildCheapsharkSearchUrl(input);
}
