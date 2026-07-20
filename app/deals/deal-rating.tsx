import {
  formatRatingBadgeValue,
  formatRatingSourceLabel,
  getScoreBadgeClass,
} from "@/lib/format-rating";
import { cn } from "@/lib/cn";
import type { RatingSource } from "@/types/deal";

interface DealRatingProps {
  rating: number;
  source: RatingSource;
}

/** Detail-page rating: loud score tile + source label. */
export function DealRating({ rating, source }: DealRatingProps) {
  const value = formatRatingBadgeValue(rating, source);
  const sourceLabel = formatRatingSourceLabel(source);
  const isSteam = source === "steam";

  return (
    <div
      className="inline-flex items-center gap-3"
      aria-label={`${value}${isSteam ? "" : " out of 100"} · ${sourceLabel}`}
    >
      <span
        className={cn(
          "flex h-14 min-w-14 items-center justify-center rounded-md px-2.5 font-display text-2xl font-bold tabular-nums leading-none tracking-tight",
          getScoreBadgeClass(rating, source),
        )}
      >
        {value}
      </span>
      <span className="flex flex-col gap-0.5 leading-tight">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          {sourceLabel}
        </span>
        <span className="text-sm font-medium text-fg">
          {isSteam ? "User reviews" : "Score"}
          {!isSteam ? (
            <span className="text-muted"> / 100</span>
          ) : null}
        </span>
      </span>
    </div>
  );
}
