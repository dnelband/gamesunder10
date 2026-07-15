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

/** Metacritic-style score colors; Steam uses a distinct neutral badge. */
export function getScoreBadgeClass(
  rating: number,
  source: RatingSource,
): string {
  if (source === "steam") {
    return "bg-slate-800 text-white";
  }

  if (rating >= 75) {
    return "bg-emerald-600 text-white";
  }
  if (rating >= 50) {
    return "bg-amber-400 text-zinc-900";
  }
  return "bg-red-600 text-white";
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
