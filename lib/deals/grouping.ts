import { CONSOLE_PLATFORMS } from "@/lib/deals/platforms";
import type {
  DealListing,
  DistributionFormat,
  GameOffer,
  RatingSource,
} from "@/types/deal";

export type PlatformFamily = "pc" | "console";

export function isConsoleFamily(platforms: string[]): boolean {
  return platforms.some((platform) =>
    (CONSOLE_PLATFORMS as readonly string[]).includes(platform),
  );
}

export function platformFamily(platforms: string[]): PlatformFamily {
  return isConsoleFamily(platforms) ? "console" : "pc";
}

export function buildGroupKey(deal: {
  platforms: string[];
  steamAppId: string | null;
  normalizedTitle: string;
}): string {
  const family = platformFamily(deal.platforms);
  if (deal.steamAppId) {
    return `${family}~s~${deal.steamAppId}`;
  }
  const encoded = Buffer.from(deal.normalizedTitle, "utf8").toString("base64url");
  return `${family}~t~${encoded}`;
}

export function parseGroupKey(key: string): {
  family: PlatformFamily;
  steamAppId: string | null;
  normalizedTitle: string | null;
} | null {
  const parts = key.split("~");
  if (parts.length !== 3) {
    return null;
  }

  const [family, kind, value] = parts;
  if (family !== "pc" && family !== "console") {
    return null;
  }

  if (kind === "s") {
    return { family, steamAppId: value, normalizedTitle: null };
  }

  if (kind === "t") {
    try {
      const normalizedTitle = Buffer.from(value, "base64url").toString("utf8");
      if (!normalizedTitle) {
        return null;
      }
      return { family, steamAppId: null, normalizedTitle };
    } catch {
      return null;
    }
  }

  return null;
}

export type DealForGrouping = DealListing & {
  normalizedTitle: string;
};

function pickBestGenres(groupDeals: DealForGrouping[]): string[] {
  const withGenres = groupDeals.find((deal) => deal.genres.length > 0);
  return withGenres?.genres ?? groupDeals[0]?.genres ?? [];
}

function pickBestRating(
  groupDeals: DealForGrouping[],
): { rating: number | null; ratingSource: RatingSource | null } {
  const rated = groupDeals.find(
    (deal) => deal.rating !== null && deal.ratingSource,
  );
  return {
    rating: rated?.rating ?? null,
    ratingSource: rated?.ratingSource ?? null,
  };
}

function pickLatestReleaseDate(groupDeals: DealForGrouping[]): string | null {
  let latest: string | null = null;
  for (const deal of groupDeals) {
    if (!deal.sourceReleaseDate) {
      continue;
    }
    if (!latest || deal.sourceReleaseDate > latest) {
      latest = deal.sourceReleaseDate;
    }
  }
  return latest;
}

function toListing(deal: DealForGrouping): DealListing {
  return {
    id: deal.id,
    source: deal.source,
    title: deal.title,
    storeName: deal.storeName,
    steamAppId: deal.steamAppId,
    priceEur: deal.priceEur,
    originalPriceEur: deal.originalPriceEur,
    url: deal.url,
    imageUrl: deal.imageUrl,
    sourceReleaseDate: deal.sourceReleaseDate,
    distributionFormat: deal.distributionFormat,
    genres: deal.genres,
    platforms: deal.platforms,
    rating: deal.rating,
    ratingSource: deal.ratingSource,
  };
}

function pickDistributionFormat(
  groupDeals: DealForGrouping[],
): DistributionFormat {
  const formats = new Set(groupDeals.map((deal) => deal.distributionFormat));
  if (formats.size === 1) {
    return groupDeals[0].distributionFormat;
  }
  return "unknown";
}

export function groupDealsIntoOffers(deals: DealForGrouping[]): GameOffer[] {
  const groups = new Map<string, DealForGrouping[]>();

  for (const deal of deals) {
    const groupKey = buildGroupKey(deal);
    const bucket = groups.get(groupKey);
    if (bucket) {
      bucket.push(deal);
    } else {
      groups.set(groupKey, [deal]);
    }
  }

  const offers: GameOffer[] = [];

  for (const [groupKey, groupDeals] of groups) {
    const sorted = [...groupDeals].sort((a, b) => a.priceEur - b.priceEur);
    const lead = sorted[0];
    const { rating, ratingSource } = pickBestRating(sorted);
    const imageUrl =
      sorted.find((deal) => deal.imageUrl)?.imageUrl ?? lead.imageUrl;

    offers.push({
      groupKey,
      title: lead.title,
      imageUrl,
      genres: pickBestGenres(sorted),
      platforms: [...new Set(sorted.flatMap((deal) => deal.platforms))].sort(),
      rating,
      ratingSource,
      sourceReleaseDate: pickLatestReleaseDate(sorted),
      distributionFormat: pickDistributionFormat(sorted),
      minPriceEur: lead.priceEur,
      maxOriginalPriceEur: Math.max(
        ...sorted.map((deal) => deal.originalPriceEur),
      ),
      offers: sorted.map(toListing),
      offerCount: sorted.length,
    });
  }

  offers.sort((a, b) => {
    const originalDiff = b.maxOriginalPriceEur - a.maxOriginalPriceEur;
    if (originalDiff !== 0) {
      return originalDiff;
    }
    const aDate = a.sourceReleaseDate ?? "";
    const bDate = b.sourceReleaseDate ?? "";
    return bDate.localeCompare(aDate);
  });

  return offers;
}
