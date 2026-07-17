import { getIgdbPsnExternalGameSource } from "@/lib/sources/psn/config";
import { getIgdbXboxExternalGameSource } from "@/lib/sources/xbox/config";
import type { NormalizedDeal } from "@/types/deal";
import type { GameMetadata } from "@/types/enrichment";

import {
  fetchGameMetadataBatchFromExternalStore,
  fetchGameMetadataBatchFromIgdb,
  fetchGameMetadataByExactTitles,
} from "./igdb-client";

const IGDB_BATCH_SIZE = 500;

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function needsIgdbEnrichment(deal: NormalizedDeal): boolean {
  return (
    deal.genres.length === 0 ||
    deal.rating === null ||
    deal.description === null ||
    deal.coverUrl === null ||
    deal.screenshotUrls.length === 0
  );
}

function psnProductIdFromUrl(url: string): string | null {
  const match = url.match(/\/product\/([^/?#]+)/);
  return match?.[1] ?? null;
}

function mergeIgdbMetadata(
  deal: NormalizedDeal,
  metadata: GameMetadata | null | undefined,
): NormalizedDeal {
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
    description: deal.description ?? metadata.description,
    coverUrl: deal.coverUrl ?? metadata.coverUrl,
    screenshotUrls:
      deal.screenshotUrls.length > 0
        ? deal.screenshotUrls
        : metadata.screenshotUrls,
    sourceReleaseDate: deal.sourceReleaseDate ?? metadata.releaseDate,
  };
}

function firstMatchingMetadata(
  keys: string[],
  metadataByKey: Record<string, GameMetadata | null>,
): GameMetadata | null {
  for (const key of keys) {
    const metadata = metadataByKey[key];
    if (metadata) {
      return metadata;
    }
  }
  return null;
}

function lookupKeysForDeal(deal: NormalizedDeal): string[] {
  const keys: string[] = [];
  if (deal.steamAppId) {
    keys.push(deal.steamAppId);
  }
  if (deal.externalStoreUid) {
    keys.push(deal.externalStoreUid);
  }
  if (deal.source === "psn") {
    const productId = psnProductIdFromUrl(deal.url);
    if (productId) {
      keys.push(productId);
    }
  }
  return keys;
}

function titleLookupKey(deal: NormalizedDeal): string | null {
  const title = deal.title.trim();
  return title.length > 0 ? title : null;
}

/** Enrich deals from IGDB at cron time. Pages read Postgres only — no live IGDB. */
export async function enrichDealsFromIgdb(
  deals: NormalizedDeal[],
): Promise<NormalizedDeal[]> {
  const dealsNeedingEnrichment = deals.filter(needsIgdbEnrichment);
  if (dealsNeedingEnrichment.length === 0) {
    return deals;
  }

  const steamIdsNeedingLookup = [
    ...new Set(
      dealsNeedingEnrichment
        .filter((deal) => deal.steamAppId !== null)
        .map((deal) => deal.steamAppId as string),
    ),
  ];

  const psnUidsNeedingLookup = [
    ...new Set(
      dealsNeedingEnrichment
        .filter((deal) => deal.source === "psn")
        .flatMap((deal) => {
          const keys: string[] = [];
          if (deal.externalStoreUid) {
            keys.push(deal.externalStoreUid);
          }
          const productId = psnProductIdFromUrl(deal.url);
          if (productId) {
            keys.push(productId);
          }
          return keys;
        }),
    ),
  ];

  const xboxUidsNeedingLookup = [
    ...new Set(
      dealsNeedingEnrichment
        .filter((deal) => deal.source === "xbox" && deal.externalStoreUid)
        .map((deal) => deal.externalStoreUid as string),
    ),
  ];

  const metadataBySteamId: Record<string, GameMetadata | null> = {};
  for (const batch of chunk(steamIdsNeedingLookup, IGDB_BATCH_SIZE)) {
    Object.assign(
      metadataBySteamId,
      await fetchGameMetadataBatchFromIgdb(batch),
    );
  }

  const metadataByPsnUid: Record<string, GameMetadata | null> = {};
  for (const batch of chunk(psnUidsNeedingLookup, IGDB_BATCH_SIZE)) {
    Object.assign(
      metadataByPsnUid,
      await fetchGameMetadataBatchFromExternalStore(
        batch,
        getIgdbPsnExternalGameSource(),
      ),
    );
  }

  const metadataByXboxUid: Record<string, GameMetadata | null> = {};
  for (const batch of chunk(xboxUidsNeedingLookup, IGDB_BATCH_SIZE)) {
    Object.assign(
      metadataByXboxUid,
      await fetchGameMetadataBatchFromExternalStore(
        batch,
        getIgdbXboxExternalGameSource(),
      ),
    );
  }

  let enriched = deals.map((deal) => {
    if (!needsIgdbEnrichment(deal)) {
      return deal;
    }

    if (deal.steamAppId) {
      return mergeIgdbMetadata(deal, metadataBySteamId[deal.steamAppId]);
    }

    if (deal.source === "psn") {
      const keys: string[] = [];
      if (deal.externalStoreUid) {
        keys.push(deal.externalStoreUid);
      }
      const productId = psnProductIdFromUrl(deal.url);
      if (productId) {
        keys.push(productId);
      }
      return mergeIgdbMetadata(deal, firstMatchingMetadata(keys, metadataByPsnUid));
    }

    if (deal.source === "xbox" && deal.externalStoreUid) {
      return mergeIgdbMetadata(
        deal,
        metadataByXboxUid[deal.externalStoreUid],
      );
    }

    return deal;
  });

  const titlesNeedingLookup = [
    ...new Set(
      enriched
        .filter(needsIgdbEnrichment)
        .map(titleLookupKey)
        .filter((title): title is string => title !== null),
    ),
  ];

  const metadataByTitle: Record<string, GameMetadata | null> = {};
  for (const batch of chunk(titlesNeedingLookup, 50)) {
    Object.assign(
      metadataByTitle,
      await fetchGameMetadataByExactTitles(batch),
    );
  }

  enriched = enriched.map((deal) => {
    if (!needsIgdbEnrichment(deal)) {
      return deal;
    }

    const title = titleLookupKey(deal);
    return title ? mergeIgdbMetadata(deal, metadataByTitle[title]) : deal;
  });

  return enriched;
}
