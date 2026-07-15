import type { DealSource } from "@/types/deal-source";

export type RatingSource = "metacritic" | "steam" | "store" | "igdb";

export interface NormalizedDeal {
  id: string;
  source: DealSource;
  title: string;
  normalizedTitle: string;
  steamAppId: string | null;
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
  rating: number | null;
  ratingSource: RatingSource | null;
  fetchedAt: string;
}
