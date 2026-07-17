export const XBOX_EMERALD_BROWSE_URL =
  "https://emerald.xboxservices.com/xboxcomfd/browse";

export const XBOX_PAGE_SIZE = 50;
/** Safety cap — full DE catalog is ~17k items (~340 pages at 50/page). */
export const XBOX_MAX_PAGES = 400;
export const XBOX_REQUEST_DELAY_MS = 300;
export const XBOX_MAX_PRICE_EUR = 10;

export function getXboxLocale(): string {
  return process.env.XBOX_LOCALE ?? "de-DE";
}

export function getXboxMarket(): string {
  return process.env.XBOX_MARKET ?? "DE";
}

/** IGDB `external_game_sources` id for Microsoft Store listings. */
export function getIgdbXboxExternalGameSource(): number {
  const configured = process.env.IGDB_XBOX_EXTERNAL_GAME_SOURCE;
  if (configured) {
    return Number.parseInt(configured, 10);
  }
  return 11;
}
