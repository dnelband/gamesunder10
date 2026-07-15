import { getPsnStorePath } from "./config";

export function buildPsnStoreUrl(productId: string): string {
  const storePath = getPsnStorePath();
  return `https://store.playstation.com/${storePath}/product/${productId}`;
}
