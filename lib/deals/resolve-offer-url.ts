import { buildCheapsharkOfferUrl } from "@/lib/sources/cheapshark/store-url";
import { buildXboxStoreUrl } from "@/lib/sources/xbox/store-url";
import type { DealSource } from "@/types/deal-source";

export interface OfferUrlInput {
  source: DealSource | string;
  storeName: string;
  title: string;
  steamAppId: string | null;
  externalStoreUid?: string | null;
  /** Ingested product URL — used for sources without a render-time builder. */
  url: string;
}

/**
 * Resolve the outbound buy URL at render time.
 * CheapShark: product first, then store search.
 * Xbox: title slug + product id (never trust stale ingest paths).
 * Other sources: use the product URL stored at ingest.
 *
 * Affiliate tags later: wrap the returned URL here in one place.
 */
export function resolveOfferUrl(offer: OfferUrlInput): string | null {
  if (offer.source === "cheapshark") {
    const built = buildCheapsharkOfferUrl({
      storeName: offer.storeName,
      title: offer.title,
      steamAppId: offer.steamAppId,
    });
    return built?.url ?? null;
  }

  if (offer.source === "xbox") {
    const productId =
      offer.externalStoreUid?.trim() ||
      xboxProductIdFromStoredUrl(offer.url);
    if (productId) {
      return buildXboxStoreUrl(offer.title, productId);
    }
  }

  const stored = offer.url?.trim();
  return stored || null;
}

/** Last path segment under `/games/store/` is the Microsoft product id. */
function xboxProductIdFromStoredUrl(url: string): string | null {
  try {
    const path = new URL(url).pathname;
    const match = path.match(/\/games\/store\/(?:[^/]+\/)?([^/]+)\/?$/i);
    return match?.[1]?.trim() || null;
  } catch {
    return null;
  }
}
