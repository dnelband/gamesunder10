import {
  getXboxLocale,
  getXboxMarket,
  XBOX_EMERALD_BROWSE_URL,
} from "./config";
import {
  emeraldBrowseResponseSchema,
  type EmeraldProductSummary,
} from "./schema";

export interface XboxBrowsePage {
  summaries: EmeraldProductSummary[];
  totalItems: number | null;
}

function browseHeaders(): HeadersInit {
  const locale = getXboxLocale();
  return {
    "User-Agent":
      "Mozilla/5.0 (compatible; gamesunder10/1.0; +https://github.com/)",
    "MS-CV": `gamesunder10.${Date.now()}`,
    "Accept-Language": locale,
    Referer: `https://www.xbox.com/${locale}/games/browse/GameDeals`,
    Origin: "https://www.xbox.com",
  };
}

function totalItemsFromChannels(
  channels: Record<string, { totalItems?: number }> | undefined,
): number | null {
  if (!channels) {
    return null;
  }
  const first = Object.values(channels)[0];
  return first?.totalItems ?? null;
}

export async function fetchXboxBrowsePage(
  pageNumber: number,
  pageSize: number,
): Promise<XboxBrowsePage> {
  const market = getXboxMarket();
  const locale = getXboxLocale();
  const url = new URL(XBOX_EMERALD_BROWSE_URL);
  url.searchParams.set("locale", locale);
  url.searchParams.set("market", market);
  url.searchParams.set("pageNumber", String(pageNumber));
  url.searchParams.set("resultsPerPage", String(pageSize));

  const response = await fetch(url, { headers: browseHeaders() });

  if (!response.ok) {
    throw new Error(`Xbox Emerald browse failed: ${response.status}`);
  }

  const json: unknown = await response.json();
  const parsed = emeraldBrowseResponseSchema.parse(json);
  return {
    summaries: parsed.productSummaries ?? [],
    totalItems: totalItemsFromChannels(parsed.channels),
  };
}
