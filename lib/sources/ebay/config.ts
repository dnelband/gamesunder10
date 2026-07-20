/** eBay Browse API — DE physical games PoC (free developer app). */

export { MAX_PRICE_EUR as EBAY_MAX_PRICE_EUR } from "@/lib/pricing";
export const EBAY_PAGE_SIZE = 200;
/** Cap API pages per run (200 × 10 = 2k listings scanned). */
export const EBAY_MAX_PAGES = 10;
export const EBAY_REQUEST_DELAY_MS = 250;

export const EBAY_MARKETPLACE_ID = "EBAY_DE";
export const EBAY_REGION = "DE";

/**
 * Leaf category: Videospiele on many marketplaces.
 * Override with EBAY_CATEGORY_ID if Taxonomy shows a different DE id.
 */
export function getEbayCategoryId(): string {
  return process.env.EBAY_CATEGORY_ID?.trim() || "139973";
}

export function getEbayClientId(): string {
  const value = process.env.EBAY_CLIENT_ID?.trim();
  if (!value) {
    throw new Error("EBAY_CLIENT_ID is not set");
  }
  return value;
}

export function getEbayClientSecret(): string {
  const value = process.env.EBAY_CLIENT_SECRET?.trim();
  if (!value) {
    throw new Error("EBAY_CLIENT_SECRET is not set");
  }
  return value;
}
