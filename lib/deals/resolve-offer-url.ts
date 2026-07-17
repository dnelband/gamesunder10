import { buildCheapsharkOfferUrl } from "@/lib/sources/cheapshark/store-url";
import type { DealSource } from "@/types/deal-source";

export interface OfferUrlInput {
  source: DealSource | string;
  storeName: string;
  title: string;
  steamAppId: string | null;
  /** Ingested product URL — used for non-CheapShark sources. */
  url: string;
}

/**
 * Resolve the outbound buy URL at render time.
 * CheapShark: product first, then store search when product needs an
 * unknowable id / has no product builder yet (never DB url, never DDG).
 * Other sources: use the product URL stored at ingest.
 * Returns null only when neither product nor search can be built.
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

  const stored = offer.url?.trim();
  return stored || null;
}
