import type { GameMetadata } from "@/types/enrichment";

import { getIgdbAccessToken, getIgdbClientId } from "./igdb-auth";

interface IgdbExternalGame {
  game: number;
  uid: string;
}

interface IgdbGame {
  id: number;
  summary?: string;
  aggregated_rating?: number;
  first_release_date?: number;
  genres?: Array<{ name: string }>;
  cover?: { url?: string };
  screenshots?: Array<{ url?: string }>;
}

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

export async function fetchGameMetadataBatchFromIgdb(
  steamAppIds: string[],
): Promise<Record<string, GameMetadata | null>> {
  const result: Record<string, GameMetadata | null> = {};
  for (const id of steamAppIds) {
    result[id] = null;
  }

  if (steamAppIds.length === 0) {
    return result;
  }

  const clientId = getIgdbClientId();
  const token = await getIgdbAccessToken();
  if (!clientId || !token) {
    return result;
  }

  const uidFilter = steamAppIds.map((id) => `"${id}"`).join(",");
  const externalGames = await igdbPost<IgdbExternalGame>(
    "external_games",
    `fields game, uid; where external_game_source = 1 & uid = (${uidFilter}); limit 500;`,
  );

  const steamIdsByGameId = new Map<number, string[]>();
  for (const row of externalGames) {
    const existing = steamIdsByGameId.get(row.game) ?? [];
    existing.push(row.uid);
    steamIdsByGameId.set(row.game, existing);
  }

  const gameIds = [...steamIdsByGameId.keys()];
  if (gameIds.length === 0) {
    return result;
  }

  const games = await igdbPost<IgdbGame>(
    "games",
    `fields summary, aggregated_rating, first_release_date, genres.name, cover.url, screenshots.url; where id = (${gameIds.join(",")}); limit 500;`,
  );

  for (const game of games) {
    const metadata = mapGame(game);
    for (const steamId of steamIdsByGameId.get(game.id) ?? []) {
      result[steamId] = metadata;
    }
  }

  return result;
}
