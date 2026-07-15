/**
 * On-demand IGDB lookups for games outside the deals dataset (e.g. wishlist).
 * Deal pages read enrichment snapshots from Postgres — filled at cron via
 * enrichDealsFromIgdb(), not through this module.
 */
import { cacheLife, cacheTag } from "next/cache";

import type { GameMetadata } from "@/types/enrichment";

import { getIgdbAccessToken, getIgdbClientId } from "./igdb-auth";
import { fetchGameMetadataBatchFromIgdb } from "./igdb-client";

async function getCachedGameMetadataForSteamAppIds(
  steamAppIds: string[],
): Promise<Record<string, GameMetadata | null>> {
  "use cache";

  for (const id of steamAppIds) {
    cacheTag(`igdb:game:${id}`);
  }
  cacheLife("days");

  return fetchGameMetadataBatchFromIgdb(steamAppIds);
}

export async function getGameMetadataForSteamAppIds(
  steamAppIds: string[],
): Promise<Record<string, GameMetadata | null>> {
  const uniqueIds = [...new Set(steamAppIds.filter(Boolean))].sort();

  if (uniqueIds.length === 0) {
    return {};
  }

  const hasCredentials =
    Boolean(getIgdbClientId()) && Boolean(process.env.IGDB_CLIENT_SECRET);

  if (!hasCredentials) {
    return fetchGameMetadataBatchFromIgdb(uniqueIds);
  }

  return getCachedGameMetadataForSteamAppIds(uniqueIds);
}

export async function getGameMetadata(
  steamAppId: string,
): Promise<GameMetadata | null> {
  const batch = await getGameMetadataForSteamAppIds([steamAppId]);
  return batch[steamAppId] ?? null;
}
