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

  switch (storeId) {
    case "1": {
      const steamAppId = validSteamAppId(input.steamAppId);
      if (!steamAppId) {
        return null;
      }
      return {
        storeId,
        kind: "product",
        url: `https://store.steampowered.com/app/${steamAppId}`,
      };
    }
    case "2": {
      const slug = titleToHyphenSlug(input.title);
      if (!slug) {
        return null;
      }
      return {
        storeId,
        kind: "product",
        url: `https://www.gamersgate.com/product/${slug}/`,
      };
    }
    case "3": {
      const slug = titleToGmgSlug(input.title);
      if (!slug) {
        return null;
      }
      return {
        storeId,
        kind: "product",
        url: `https://www.greenmangaming.com/games/${slug}/`,
      };
    }
    case "7": {
      const slug = titleToGogSlug(input.title);
      if (!slug) {
        return null;
      }
      return {
        storeId,
        kind: "product",
        url: `https://www.gog.com/en/game/${slug}`,
      };
    }
    case "11": {
      // Humble Store
      const slug = titleToHyphenSlug(input.title);
      if (!slug) {
        return null;
      }
      return {
        storeId,
        kind: "product",
        url: `https://www.humblebundle.com/store/${slug}`,
      };
    }
    case "15": {
      // Fanatical
      const slug = titleToHyphenSlug(input.title);
      if (!slug) {
        return null;
      }
      return {
        storeId,
        kind: "product",
        url: `https://www.fanatical.com/en/game/${slug}`,
      };
    }
    case "23": {
      // GameBillet — root path slug (not /games/…)
      const slug = titleToHyphenSlug(input.title);
      if (!slug) {
        return null;
      }
      return {
        storeId,
        kind: "product",
        url: `https://www.gamebillet.com/${slug}`,
      };
    }
    case "25": {
      const slug = titleToEpicSlug(input.title);
      if (!slug) {
        return null;
      }
      return {
        storeId,
        kind: "product",
        url: `https://store.epicgames.com/p/${slug}?lang=de`,
      };
    }
    default:
      return null;
  }
}

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

  const query = encodeURIComponent(input.title);

  switch (storeId) {
    case "1":
      return {
        storeId,
        kind: "search",
        url: `https://store.steampowered.com/search/?term=${query}`,
      };
    case "2":
      return {
        storeId,
        kind: "search",
        url: `https://www.gamersgate.com/games?query=${query}`,
      };
    case "3":
      return {
        storeId,
        kind: "search",
        url: `https://www.greenmangaming.com/search?query=${query}`,
      };
    case "7":
      return {
        storeId,
        kind: "search",
        url: `https://www.gog.com/en/games?query=${query}`,
      };
    case "11":
      return {
        storeId,
        kind: "search",
        url: `https://www.humblebundle.com/store/search?search=${query}`,
      };
    case "13":
      return {
        storeId,
        kind: "search",
        url: `https://store.ubisoft.com/de/search?q=${query}`,
      };
    case "15":
      return {
        storeId,
        kind: "search",
        url: `https://www.fanatical.com/en/search?search=${query}`,
      };
    case "21":
      // WinGameStore product URLs need a numeric id CheapShark does not provide.
      return {
        storeId,
        kind: "search",
        url: `https://www.wingamestore.com/search/?Search=${query}`,
      };
    case "23":
      return {
        storeId,
        kind: "search",
        url: `https://www.gamebillet.com/search?q=${query}`,
      };
    case "25":
      return {
        storeId,
        kind: "search",
        url: `https://store.epicgames.com/browse?q=${query}&sortBy=relevancy&sortDir=DESC&count=40&lang=de`,
      };
    case "27":
      return {
        storeId,
        kind: "search",
        url: `https://www.gamesplanet.com/search?query=${query}`,
      };
    case "30":
      return {
        storeId,
        kind: "search",
        url: `https://www.indiegala.com/store/search?q=${query}`,
      };
    default:
      return null;
  }
}

/** Product first, then store search. Never DDG. */
export function buildCheapsharkOfferUrl(
  input: CheapsharkUrlInput,
): StoreUrlResult | null {
  return buildCheapsharkProductUrl(input) ?? buildCheapsharkSearchUrl(input);
}

/** @deprecated Prefer buildCheapsharkOfferUrl */
export function buildCheapsharkStoreUrl(
  deal: {
    storeID: string;
    title: string;
    steamAppID?: string | null;
  },
  storeName?: string,
): string {
  return (
    buildCheapsharkOfferUrl({
      storeId: deal.storeID,
      storeName,
      title: deal.title,
      steamAppId: deal.steamAppID,
    })?.url ?? ""
  );
}

export function buildCheapsharkStoreUrlResult(
  deal: {
    storeID: string;
    title: string;
    steamAppID?: string | null;
  },
  storeName?: string,
): { url: string; kind: StoreUrlKind; storeId: string } {
  const result = buildCheapsharkOfferUrl({
    storeId: deal.storeID,
    storeName,
    title: deal.title,
    steamAppId: deal.steamAppID,
  });
  if (result) {
    return result;
  }
  return {
    storeId: deal.storeID,
    kind: "omit",
    url: "",
  };
}

export function buildEpicProductUrlGuess(title: string): string {
  const slug = titleToEpicSlug(title);
  return `https://store.epicgames.com/p/${slug}?lang=de`;
}
