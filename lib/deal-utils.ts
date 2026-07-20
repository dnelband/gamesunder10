import { createHash } from "node:crypto";

export function buildDealId(source: string, sourceDealId: string): string {
  return createHash("sha256")
    .update(`${source}:${sourceDealId}`)
    .digest("hex")
    .slice(0, 32);
}

export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Longest first so multi-word suffixes win over shorter overlaps. */
const WISHLIST_EDITION_SUFFIXES = [
  "game of the year edition",
  "definitive edition",
  "ultimate edition",
  "complete edition",
  "deluxe edition",
  "gold edition",
] as const;

/**
 * Base title for wishlist ↔ deal matching when no steamAppId exists.
 * Strips at most one trailing edition suffix from a small explicit allowlist.
 */
export function canonicalizeWishlistMatchTitle(title: string): string {
  let normalized = normalizeTitle(title);

  for (const suffix of WISHLIST_EDITION_SUFFIXES) {
    const trailing = ` ${suffix}`;
    if (normalized.endsWith(trailing)) {
      normalized = normalized.slice(0, -trailing.length).trimEnd();
      break;
    }
  }

  return normalized;
}

export function wishlistTitlesMatch(a: string, b: string): boolean {
  return canonicalizeWishlistMatchTitle(a) === canonicalizeWishlistMatchTitle(b);
}
