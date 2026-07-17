import type { RatingSource } from "@/types/deal";

export function formatRatingLabel(
  rating: number,
  source: RatingSource,
): string {
  const value = Math.round(rating);

  switch (source) {
    case "steam":
      return `${value}% positive`;
    case "metacritic":
    case "igdb":
    case "store":
      return `${value}`;
    default:
      return `${value}`;
  }
}

/** Compact display for card badges (no source name, minimal suffix). */
export function formatRatingBadgeValue(
  rating: number,
  source: RatingSource,
): string {
  const value = Math.round(rating);
  return source === "steam" ? `${value}%` : `${value}`;
}

/** Score badge colors aligned to Arcade brand tokens. */
export function getScoreBadgeClass(
  rating: number,
  source: RatingSource,
): string {
  if (source === "steam") {
    return "bg-surface-2 text-fg";
  }

  if (rating >= 75) {
    return "bg-cut text-bg";
  }
  if (rating >= 50) {
    return "bg-price text-bg";
  }
  return "bg-danger text-fg";
}

export function formatRatingSourceLabel(source: RatingSource): string {
  switch (source) {
    case "metacritic":
      return "Metacritic";
    case "steam":
      return "Steam";
    case "igdb":
      return "IGDB";
    case "store":
      return "Store";
    default:
      return "Rating";
  }
}
