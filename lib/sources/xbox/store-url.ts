import { getXboxLocale } from "./config";

export function buildXboxStoreUrl(productId: string): string {
  const locale = getXboxLocale();
  return `https://www.xbox.com/${locale}/games/store/${productId}`;
}
