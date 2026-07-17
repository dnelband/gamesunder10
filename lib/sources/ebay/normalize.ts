import { buildDealId, normalizeTitle } from "@/lib/deal-utils";
import type { NormalizedDeal } from "@/types/deal";

import { EBAY_MAX_PRICE_EUR, EBAY_REGION } from "./config";
import type { EbayItemSummary } from "./schema";

const DIGITAL_TITLE_RE =
  /\b(digital(er)?|download|code|key|cd[\s-]?key|guthaben|account|psn[\s-]?card|xbox[\s-]?live|nintendo[\s-]?eshop)\b/i;

function parseEur(value: string | undefined): number {
  if (!value) {
    return Number.NaN;
  }
  return Number.parseFloat(value);
}

function inferPlatforms(title: string): string[] {
  const lower = title.toLowerCase();
  const platforms: string[] = [];

  if (
    /\b(ps5|playstation\s*5|playStation 5)\b/i.test(title) ||
    lower.includes("ps 5")
  ) {
    platforms.push("PS5");
  }
  if (/\b(ps4|playstation\s*4)\b/i.test(title) || lower.includes("ps 4")) {
    platforms.push("PS4");
  }
  if (
    /\b(xbox\s*series|series\s*[xs]|xss)\b/i.test(title) ||
    lower.includes("xbox series")
  ) {
    platforms.push("Xbox Series X|S");
  }
  if (/\bxbox\s*one\b/i.test(title)) {
    platforms.push("Xbox One");
  }

  return [...new Set(platforms)];
}

function looksDigitalOnly(title: string): boolean {
  return DIGITAL_TITLE_RE.test(title);
}

function conditionLabel(condition: string | undefined): string {
  if (!condition) {
    return "eBay";
  }
  const lower = condition.toLowerCase();
  if (lower.includes("new") || lower.includes("neu")) {
    return "eBay · New";
  }
  return `eBay · ${condition}`;
}

function pickImage(item: EbayItemSummary): string | null {
  return (
    item.image?.imageUrl ??
    item.thumbnailImages?.[0]?.imageUrl ??
    null
  );
}

export function normalizeEbayItem(
  item: EbayItemSummary,
): NormalizedDeal | null {
  if (looksDigitalOnly(item.title)) {
    return null;
  }

  const priceEur = parseEur(item.price?.value);
  if (
    Number.isNaN(priceEur) ||
    item.price?.currency !== "EUR" ||
    priceEur <= 0 ||
    priceEur > EBAY_MAX_PRICE_EUR
  ) {
    return null;
  }

  const platforms = inferPlatforms(item.title);
  if (platforms.length === 0) {
    // PoC: only keep titles that clearly map to our console filter set.
    return null;
  }

  const url = item.itemAffiliateWebUrl ?? item.itemWebUrl;
  if (!url) {
    return null;
  }

  const buying = item.buyingOptions ?? [];
  if (buying.length > 0 && !buying.includes("FIXED_PRICE")) {
    return null;
  }

  return {
    id: buildDealId("ebay", item.itemId),
    source: "ebay",
    title: item.title,
    normalizedTitle: normalizeTitle(item.title),
    steamAppId: null,
    externalStoreUid: item.itemId,
    storeName: conditionLabel(item.condition),
    priceEur,
    originalPriceEur: priceEur,
    discountPercent: 0,
    currencyOriginal: "EUR",
    url,
    imageUrl: pickImage(item),
    region: EBAY_REGION,
    sourceReleaseDate: null,
    distributionFormat: "physical",
    genres: [],
    platforms,
    rating: null,
    ratingSource: null,
    description: null,
    coverUrl: pickImage(item),
    screenshotUrls: [],
    fetchedAt: new Date().toISOString(),
  };
}
