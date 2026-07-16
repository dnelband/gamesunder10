import Image from "next/image";
import Link from "next/link";

import {
  formatRatingBadgeValue,
  getScoreBadgeClass,
} from "@/lib/format-rating";
import { sortPlatforms } from "@/lib/format-platform";
import type { DealListing } from "@/types/deal";

const overlayClass =
  "bg-white/90 shadow-sm backdrop-blur-sm dark:bg-zinc-950/90";

const cardImageSizes =
  "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, (max-width: 1536px) 20vw, 16vw";

export function DealCard({ deal }: { deal: DealListing }) {
  const platforms = sortPlatforms(deal.platforms);

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        <Link href={`/deals/${deal.id}`} className="absolute inset-0 block">
          {deal.imageUrl ? (
            <Image
              src={deal.imageUrl}
              alt=""
              fill
              sizes={cardImageSizes}
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
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
            €{deal.priceEur.toFixed(2)}
          </span>
          {deal.originalPriceEur > deal.priceEur ? (
            <span className="text-sm text-zinc-500 line-through">
              €{deal.originalPriceEur.toFixed(2)}
            </span>
          ) : null}
        </span>

        {deal.rating !== null && deal.ratingSource ? (
          <div
            className={`pointer-events-none absolute bottom-2 right-2 z-10 flex min-w-10 items-center justify-center rounded-md px-2 py-1.5 text-lg font-bold leading-none shadow-sm ${getScoreBadgeClass(deal.rating, deal.ratingSource)}`}
            aria-label={`Score ${formatRatingBadgeValue(deal.rating, deal.ratingSource)}`}
            title={`Score ${formatRatingBadgeValue(deal.rating, deal.ratingSource)}`}
          >
            {formatRatingBadgeValue(deal.rating, deal.ratingSource)}
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-1 flex-col gap-2">
          <Link
            href={`/deals/${deal.id}`}
            className="line-clamp-2 text-lg font-semibold leading-snug hover:underline"
          >
            {deal.title}
          </Link>
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <span>{deal.storeName}</span>
            {deal.sourceReleaseDate ? (
              <>
                <span aria-hidden>·</span>
                <span>{deal.sourceReleaseDate.slice(0, 4)}</span>
              </>
            ) : null}
          </div>
        </div>

        {deal.genres.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {deal.genres.slice(0, 3).map((genre) => (
              <span
                key={genre}
                className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
              >
                {genre}
              </span>
            ))}
            {deal.genres.length > 3 ? (
              <span className="px-1 text-[11px] text-zinc-500">
                +{deal.genres.length - 3}
              </span>
            ) : null}
          </div>
        ) : null}

        <a
          href={deal.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto text-xs font-medium text-zinc-600 hover:text-foreground hover:underline dark:text-zinc-400"
        >
          View on {deal.storeName} →
        </a>
      </div>
    </article>
  );
}
