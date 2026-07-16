import type { GameMetadata } from "@/types/enrichment";

import { getIgdbAccessToken, getIgdbClientId } from "./igdb-auth";

interface IgdbExternalGame {
  game: number;
  uid: string;
}

interface IgdbGame {
  id: number;
  name?: string;
  summary?: string;
  aggregated_rating?: number;
  first_release_date?: number;
  genres?: Array<{ name: string }>;
  cover?: { url?: string };
  screenshots?: Array<{ url?: string }>;
}

const IGDB_STEAM_SOURCE = 1;

function igdbImageUrl(path: string | undefined): string | null {
  if (!path) {
    return null;
  }
  return path.replace("t_thumb", "t_cover_big").replace("//", "https://");
}

async function igdbPost<T>(endpoint: string, body: string): Promise<T[]> {
  const clientId = getIgdbClientId();
  const token = await getIgdbAccessToken();

  if (!clientId || !token) {
    return [];
  }

  const response = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
    method: "POST",
    headers: {
      "Client-ID": clientId,
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`IGDB ${endpoint} failed: ${response.status}`);
  }

  return (await response.json()) as T[];
}

function mapGame(game: IgdbGame): GameMetadata {
  return {
    igdbId: game.id,
    description: game.summary ?? null,
    genres: (game.genres ?? []).map((genre) => genre.name),
    coverUrl: igdbImageUrl(game.cover?.url),
    screenshotUrls: (game.screenshots ?? [])
      .map((shot) => igdbImageUrl(shot.url))
      .filter((url): url is string => url !== null),
    rating: game.aggregated_rating ?? null,
    releaseDate: game.first_release_date
      ? new Date(game.first_release_date * 1000).toISOString().slice(0, 10)
      : null,
  };
}

function escapeIgdbString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function normalizeIgdbLookupTitle(title: string): string {
  return title
    // German and English storefront platform suffixes.
    .replace(/\s+(for|für)\s+ps[45]\b/giu, "")
    .replace(/\s+ps[45]\b/giu, "")
    // Remove common trademark symbols seen in PSN titles.
    .replace(/[™®©]/gu, "")
    // Trim trailing storefront punctuation left after suffix removal.
    .replace(/\s*[-:|]\s*$/u, "")
    .replace(/\s+/gu, " ")
    .trim()
    .toLowerCase();
}

async function fetchGamesByIds(gameIds: number[]): Promise<IgdbGame[]> {
  if (gameIds.length === 0) {
    return [];
  }

  return igdbPost<IgdbGame>(
    "games",
    `fields name, summary, aggregated_rating, first_release_date, genres.name, cover.url, screenshots.url; where id = (${gameIds.join(",")}); limit 500;`,
  );
}

async function fetchMetadataByExternalUids(
  uids: string[],
  externalGameSource: number,
): Promise<Record<string, GameMetadata | null>> {
  const result: Record<string, GameMetadata | null> = {};
  for (const uid of uids) {
    result[uid] = null;
  }

  if (uids.length === 0) {
    return result;
  }

  const clientId = getIgdbClientId();
  const token = await getIgdbAccessToken();
  if (!clientId || !token) {
    return result;
  }

  const uidFilter = uids.map((uid) => `"${escapeIgdbString(uid)}"`).join(",");
  const externalGames = await igdbPost<IgdbExternalGame>(
    "external_games",
    `fields game, uid; where external_game_source = ${externalGameSource} & uid = (${uidFilter}); limit 500;`,
  );

  const uidsByGameId = new Map<number, string[]>();
  for (const row of externalGames) {
    const existing = uidsByGameId.get(row.game) ?? [];
    existing.push(row.uid);
    uidsByGameId.set(row.game, existing);
  }

  const games = await fetchGamesByIds([...uidsByGameId.keys()]);
  for (const game of games) {
    const metadata = mapGame(game);
    for (const uid of uidsByGameId.get(game.id) ?? []) {
      result[uid] = metadata;
    }
  }

  return result;
}

export async function fetchGameMetadataBatchFromIgdb(
  steamAppIds: string[],
): Promise<Record<string, GameMetadata | null>> {
  return fetchMetadataByExternalUids(steamAppIds, IGDB_STEAM_SOURCE);
}

export async function fetchGameMetadataBatchFromExternalStore(
  uids: string[],
  externalGameSource: number,
): Promise<Record<string, GameMetadata | null>> {
  return fetchMetadataByExternalUids(uids, externalGameSource);
}

export async function fetchGameMetadataByExactTitles(
  titles: string[],
): Promise<Record<string, GameMetadata | null>> {
  const result: Record<string, GameMetadata | null> = {};
  for (const title of titles) {
    result[title] = null;
  }

  if (titles.length === 0) {
    return result;
  }

  const clientId = getIgdbClientId();
  const token = await getIgdbAccessToken();
  if (!clientId || !token) {
    return result;
  }

  for (const title of titles) {
    const normalizedTitle = normalizeIgdbLookupTitle(title);
    const games = await igdbPost<IgdbGame>(
      "games",
      `search "${escapeIgdbString(title)}"; fields name, summary, aggregated_rating, first_release_date, genres.name, cover.url, screenshots.url; limit 10;`,
    );

    const exactMatch = games.find((game) => {
      if (!game.name) {
        return false;
      }
      return normalizeIgdbLookupTitle(game.name) === normalizedTitle;
    });
    if (exactMatch) {
      result[title] = mapGame(exactMatch);
    }
  }

  return result;
}
