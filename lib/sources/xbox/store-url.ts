import { getXboxLocale } from "./config";

/** Xbox storefront path segment from product title. */
export function titleToXboxSlug(title: string): string {
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
 * Product page URL:
 * `https://www.xbox.com/de-de/games/store/{slug}/{productId}`
 */
export function buildXboxStoreUrl(title: string, productId: string): string {
  const locale = getXboxLocale().toLowerCase();
  const slug = titleToXboxSlug(title);
  const id = productId.trim().toLowerCase();
  if (!slug || !id) {
    return `https://www.xbox.com/${locale}/games/store/${id || productId}`;
  }
  return `https://www.xbox.com/${locale}/games/store/${slug}/${id}`;
}
