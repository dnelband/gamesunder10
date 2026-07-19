import { cacheLife, cacheTag } from "next/cache";

import {
  searchIgdbGames,
  type IgdbSearchCandidate,
} from "@/lib/enrichment/igdb-client";

async function cachedSearch(
  query: string,
  limit: number,
): Promise<IgdbSearchCandidate[]> {
  "use cache";
  cacheTag("igdb-search");
  cacheLife("minutes");
  return searchIgdbGames(query, limit);
}

export async function searchGamesForWishlist(
  query: string,
  limit = 10,
): Promise<IgdbSearchCandidate[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return [];
  }
  return cachedSearch(trimmed.toLowerCase(), limit);
}

export type { IgdbSearchCandidate };
