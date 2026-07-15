export interface GameMetadata {
  igdbId: number;
  description: string | null;
  genres: string[];
  coverUrl: string | null;
  screenshotUrls: string[];
  rating: number | null;
  releaseDate: string | null;
}
