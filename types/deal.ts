import type { DealSource } from "@/types/deal-source";

export type RatingSource = "metacritic" | "steam" | "store" | "igdb";

export interface NormalizedDeal {
  id: string;
  source: DealSource;
  title: string;
  normalizedTitle: string;
  steamAppId: string | null;
  /** Store-native ID for IGDB external-game lookup (e.g. PSN npTitleId). */
  externalStoreUid: string | null;
  storeName: string;
  priceEur: number;
  originalPriceEur: number;
  discountPercent: number;
  currencyOriginal: string;
  url: string;
  imageUrl: string | null;
  region: string | null;
  sourceReleaseDate: string | null;
  genres: string[];
  platforms: string[];
  rating: number | null;
  ratingSource: RatingSource | null;
  /** IGDB snapshot — filled at ingestion, not on page views. */
  description: string | null;
  coverUrl: string | null;
  screenshotUrls: string[];
  fetchedAt: string;
}
