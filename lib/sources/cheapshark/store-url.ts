import type { CheapsharkDeal } from "./schema";

function validSteamAppId(value: string | null): string | null {
  if (!value || value === "0") {
    return null;
  }
  return value;
}

function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function internalNameToSlug(name: string): string {
  return name
    .replace(/([a-z\d])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

function storeSearchUrl(storeId: string, title: string): string {
  const query = encodeURIComponent(title);
  switch (storeId) {
    case "1":
      return `https://store.steampowered.com/search/?term=${query}`;
    case "2":
      return `https://www.gamersgate.com/games?query=${query}`;
    case "3":
      return `https://www.greenmangaming.com/search/${query}`;
    case "7":
      return `https://www.gog.com/en/games?q=${query}`;
    case "11":
      return `https://www.humblebundle.com/store/search?search=${query}`;
    case "13":
      return `https://store.ubisoft.com/us/search?q=${query}`;
    case "15":
      return `https://www.fanatical.com/en/search?search=${query}`;
    case "21":
      return `https://www.wingamestore.com/search/?Search=${query}`;
    case "23":
      return `https://www.gamebillet.com/catalogsearch/result/?q=${query}`;
    case "25":
      return `https://store.epicgames.com/en-US/browse?q=${query}`;
    case "27":
      return `https://www.gamesplanet.com/search?q=${query}`;
    case "30":
      return `https://www.indiegala.com/store/games/search?q=${query}`;
    default:
      return `https://www.google.com/search?q=${query}+game+store`;
  }
}

/** Direct store product URL when we can build one confidently; never CheapShark. */
export function buildCheapsharkStoreUrl(deal: CheapsharkDeal): string {
  const steamAppId = validSteamAppId(deal.steamAppID);
  const slug = titleToSlug(deal.title);
  const internalSlug = internalNameToSlug(deal.internalName);

  switch (deal.storeID) {
    case "1":
      if (steamAppId) {
        return `https://store.steampowered.com/app/${steamAppId}`;
      }
      break;
    case "7":
      return `https://www.gog.com/en/game/${internalSlug}`;
    case "11":
      return `https://www.humblebundle.com/store/${slug}`;
    case "25":
      return `https://store.epicgames.com/en-US/p/${internalSlug}`;
    case "13":
      if (steamAppId) {
        return `https://store.steampowered.com/app/${steamAppId}`;
      }
      return `https://store.ubisoft.com/us/${slug}`;
    default:
      break;
  }

  return storeSearchUrl(deal.storeID, deal.title);
}
