import type { NormalizedDeal } from "@/types/deal";

import { fetchGameMetadataBatchFromIgdb } from "./igdb-client";

const IGDB_BATCH_SIZE = 500;

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export async function enrichDealsFromIgdb(
  deals: NormalizedDeal[],
): Promise<NormalizedDeal[]> {
  const steamIdsNeedingLookup = [
    ...new Set(
      deals
        .filter(
          (deal) =>
            deal.steamAppId !== null &&
            (deal.genres.length === 0 || deal.rating === null),
        )
        .map((deal) => deal.steamAppId as string),
    ),
  ];

  if (steamIdsNeedingLookup.length === 0) {
    return deals;
  }

  const metadataBySteamId: Record<string, Awaited<
    ReturnType<typeof fetchGameMetadataBatchFromIgdb>
  >[string]> = {};

  for (const batch of chunk(steamIdsNeedingLookup, IGDB_BATCH_SIZE)) {
    const batchResult = await fetchGameMetadataBatchFromIgdb(batch);
    Object.assign(metadataBySteamId, batchResult);
  }

  return deals.map((deal) => {
    if (!deal.steamAppId) {
      return deal;
    }

    const metadata = metadataBySteamId[deal.steamAppId];
    if (!metadata) {
      return deal;
    }

    return {
      ...deal,
      genres: deal.genres.length > 0 ? deal.genres : metadata.genres,
      rating:
        deal.rating !== null
          ? deal.rating
          : metadata.rating !== null
            ? metadata.rating
            : null,
      ratingSource:
        deal.rating !== null
          ? deal.ratingSource
          : metadata.rating !== null
            ? "igdb"
            : deal.ratingSource,
    };
  });
}
