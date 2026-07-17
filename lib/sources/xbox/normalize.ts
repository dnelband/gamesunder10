import { buildDealId, normalizeTitle } from "@/lib/deal-utils";
import type { NormalizedDeal } from "@/types/deal";

import { XBOX_MAX_PRICE_EUR } from "./config";
import type { EmeraldProductSummary } from "./schema";
import { buildXboxStoreUrl } from "./store-url";

const EMERALD_XBOX_SERIES = "XboxSeriesX";
const EMERALD_XBOX_ONE = "XboxOne";

const LISTING_XBOX_SERIES = "Xbox Series X|S";
const LISTING_XBOX_ONE = "Xbox One";

function normalizeImageUrl(url: string | undefined): string | null {
  if (!url) {
    return null;
  }
  if (url.startsWith("//")) {
    return `https:${url}`;
  }
  return url;
}

function dealPlatforms(availableOn: string[]): string[] {
  const platforms: string[] = [];
  if (availableOn.includes(EMERALD_XBOX_SERIES)) {
    platforms.push(LISTING_XBOX_SERIES);
  }
  if (availableOn.includes(EMERALD_XBOX_ONE)) {
    platforms.push(LISTING_XBOX_ONE);
  }
  return platforms;
}

function isXboxGame(product: EmeraldProductSummary): boolean {
  if (product.productKind !== "Game") {
    return false;
  }
  return product.availableOn.some(
    (platform) => platform === EMERALD_XBOX_SERIES || platform === EMERALD_XBOX_ONE,
  );
}

function storeRating(product: EmeraldProductSummary): {
  rating: number | null;
  ratingSource: NormalizedDeal["ratingSource"];
} {
  if (product.averageRating == null || product.averageRating <= 0) {
    return { rating: null, ratingSource: null };
  }
  return {
    rating: Math.round(product.averageRating * 20),
    ratingSource: "store",
  };
}

export function normalizeXboxProduct(
  product: EmeraldProductSummary,
): NormalizedDeal | null {
  if (!isXboxGame(product)) {
    return null;
  }

  const purchase = product.specificPrices?.purchaseable?.[0];
  if (!purchase || purchase.currency !== "EUR") {
    return null;
  }

  const priceEur = purchase.listPrice;
  const originalPriceEur = purchase.msrp;

  if (priceEur <= 0 || priceEur > XBOX_MAX_PRICE_EUR) {
    return null;
  }

  const platforms = dealPlatforms(product.availableOn);
  if (platforms.length === 0) {
    return null;
  }

  const { rating, ratingSource } = storeRating(product);
  const discountPercent = Math.round(purchase.discountPercentage ?? 0);
  const imageUrl = normalizeImageUrl(product.images?.poster?.url);

  return {
    id: buildDealId("xbox", product.productId),
    source: "xbox",
    title: product.title,
    normalizedTitle: normalizeTitle(product.title),
    steamAppId: null,
    externalStoreUid: product.productId,
    storeName: "Xbox Store",
    priceEur,
    originalPriceEur:
      originalPriceEur > 0 ? originalPriceEur : priceEur,
    discountPercent,
    currencyOriginal: "EUR",
    url: buildXboxStoreUrl(product.productId),
    imageUrl,
    region: "DE",
    sourceReleaseDate: product.releaseDate ?? null,
    genres: product.categories ?? [],
    platforms,
    rating,
    ratingSource,
    description: product.shortDescription ?? product.description ?? null,
    coverUrl: imageUrl,
    screenshotUrls: [],
    fetchedAt: new Date().toISOString(),
  };
}
