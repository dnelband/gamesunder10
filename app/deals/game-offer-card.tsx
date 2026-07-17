import Link from "next/link";

import {
  formatRatingBadgeValue,
  getScoreBadgeClass,
} from "@/lib/format-rating";
import { sortPlatforms } from "@/lib/format-platform";
import type { GameOffer } from "@/types/deal";

import { DealImage } from "./deal-image";

const overlayClass =
  "bg-white/90 shadow-sm backdrop-blur-sm dark:bg-zinc-950/90";

function gameHref(groupKey: string): string {
  return `/deals/${encodeURIComponent(groupKey)}`;
}

export function GameOfferCard({ game }: { game: GameOffer }) {
  const lead = game.offers[0];
  const platforms = sortPlatforms(game.platforms);
  const href = gameHref(game.groupKey);

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        <Link href={href} className="absolute inset-0 block">
          {game.imageUrl ? (
            <DealImage
              src={game.imageUrl}
              alt=""
              fill
              className="transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-500">
              No art
            </div>
          )}
        </Link>

        {platforms.length > 0 ? (
          <div className="pointer-events-none absolute top-2 left-2 z-10 flex flex-wrap gap-1">
            {platforms.map((platform) => (
              <span
                key={platform}
                className={`rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${overlayClass}`}
              >
                {platform}
              </span>
            ))}
          </div>
        ) : null}

        <span
          className={`pointer-events-none absolute bottom-2 left-2 z-10 inline-flex items-baseline gap-2 rounded-full px-3 py-1.5 ${overlayClass}`}
        >
          <span className="text-xl font-bold leading-none tracking-tight">
            €{game.minPriceEur.toFixed(2)}
          </span>
          {lead.originalPriceEur > lead.priceEur ? (
            <span className="text-sm text-zinc-500 line-through">
              €{lead.originalPriceEur.toFixed(2)}
            </span>
          ) : null}
        </span>

        {game.rating !== null && game.ratingSource ? (
          <div
            className={`pointer-events-none absolute bottom-2 right-2 z-10 flex min-w-10 items-center justify-center rounded-md px-2 py-1.5 text-lg font-bold leading-none shadow-sm ${getScoreBadgeClass(game.rating, game.ratingSource)}`}
            aria-label={`Score ${formatRatingBadgeValue(game.rating, game.ratingSource)}`}
            title={`Score ${formatRatingBadgeValue(game.rating, game.ratingSource)}`}
          >
            {formatRatingBadgeValue(game.rating, game.ratingSource)}
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-1 flex-col gap-2">
          <Link
            href={href}
            className="line-clamp-2 text-lg font-semibold leading-snug hover:underline"
          >
            {game.title}
          </Link>
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            {game.offerCount > 1 ? (
              <span>
                {game.offerCount} stores · from €{game.minPriceEur.toFixed(2)}
              </span>
            ) : (
              <span>{lead.storeName}</span>
            )}
            {game.sourceReleaseDate ? (
              <>
                <span aria-hidden>·</span>
                <span>{game.sourceReleaseDate.slice(0, 4)}</span>
              </>
            ) : null}
          </div>
        </div>

        {game.genres.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {game.genres.slice(0, 3).map((genre) => (
              <span
                key={genre}
                className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
              >
                {genre}
              </span>
            ))}
            {game.genres.length > 3 ? (
              <span className="px-1 text-[11px] text-zinc-500">
                +{game.genres.length - 3}
              </span>
            ) : null}
          </div>
        ) : null}

        {game.offerCount > 1 ? (
          <p className="mt-auto text-xs text-zinc-500">
            Cheapest at {lead.storeName}
            {game.offers.length > 1 ? (
              <>
                {" "}
                · also{" "}
                {game.offers
                  .slice(1, 3)
                  .map((offer) => offer.storeName)
                  .join(", ")}
                {game.offerCount > 3 ? ` +${game.offerCount - 3} more` : ""}
              </>
            ) : null}
          </p>
        ) : (
          <a
            href={lead.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto text-xs font-medium text-zinc-600 hover:text-foreground hover:underline dark:text-zinc-400"
          >
            View on {lead.storeName} →
          </a>
        )}
      </div>
    </article>
  );
}
