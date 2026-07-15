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
