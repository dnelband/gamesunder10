import Link from "next/link";

import {
  formatRatingBadgeValue,
  formatRatingLabel,
  formatRatingSourceLabel,
  getScoreBadgeClass,
} from "@/lib/format-rating";
import { sortPlatforms } from "@/lib/format-platform";
import type { GameOfferDetail } from "@/types/deal";

import { DealImage } from "../deal-image";

const overlayClass =
  "bg-white/90 shadow-sm backdrop-blur-sm dark:bg-zinc-950/90";

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </dt>
      <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {value}
      </dd>
    </div>
  );
}

export function GameOfferDetailView({ game }: { game: GameOfferDetail }) {
  const lead = game.offers[0];
  const heroImageUrl = game.coverUrl ?? lead.imageUrl;
  const platforms = sortPlatforms(game.platforms);
  const onSale = lead.originalPriceEur > lead.priceEur;
  const savingsEur = onSale
    ? Math.round((lead.originalPriceEur - lead.priceEur) * 100) / 100
    : 0;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <Link
        href="/deals"
        className="inline-flex w-fit items-center gap-1 text-sm text-zinc-600 transition-colors hover:text-foreground dark:text-zinc-400"
      >
        <span aria-hidden>←</span>
        All deals
      </Link>

      <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="grid lg:grid-cols-[minmax(0,340px)_1fr]">
          <div className="relative aspect-[3/4] bg-zinc-100 dark:bg-zinc-900 lg:min-h-full">
            {heroImageUrl ? (
              <DealImage
                src={heroImageUrl}
                alt=""
                fill
                priority
              />
            ) : (
              <div className="flex h-full min-h-72 items-center justify-center text-sm text-zinc-500">
                No cover art
              </div>
            )}

            {platforms.length > 0 ? (
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
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

            <div
              className={`absolute bottom-3 left-3 inline-flex items-baseline gap-2 rounded-full px-3 py-1.5 ${overlayClass}`}
            >
              <span className="text-2xl font-bold leading-none tracking-tight">
                €{game.minPriceEur.toFixed(2)}
              </span>
              {onSale ? (
                <span className="text-sm text-zinc-500 line-through">
                  €{lead.originalPriceEur.toFixed(2)}
                </span>
              ) : null}
            </div>

            {game.rating !== null && game.ratingSource ? (
              <div
                className={`absolute right-3 bottom-3 flex min-w-11 items-center justify-center rounded-md px-2.5 py-2 text-xl font-bold leading-none shadow-sm ${getScoreBadgeClass(game.rating, game.ratingSource)}`}
              >
                {formatRatingBadgeValue(game.rating, game.ratingSource)}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-6 p-6 sm:p-8">
            <header className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {onSale && lead.originalPriceEur > lead.priceEur ? (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Save €{savingsEur.toFixed(2)}
                  </span>
                ) : null}
                {game.offerCount > 1 ? (
                  <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                    {game.offerCount} stores
                  </span>
                ) : null}
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                {game.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500">
                <span>From {lead.storeName}</span>
                {game.sourceReleaseDate ? (
                  <>
                    <span aria-hidden>·</span>
                    <span>{game.sourceReleaseDate.slice(0, 4)}</span>
                  </>
                ) : null}
              </div>

              {game.genres.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {game.genres.map((genre) => (
                    <span
                      key={genre}
                      className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              ) : null}
            </header>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={lead.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-8 text-sm font-semibold text-background transition-opacity hover:opacity-90"
              >
                Best price · {lead.storeName}
              </a>
              {game.rating !== null && game.ratingSource ? (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="font-medium text-foreground">
                    {formatRatingLabel(game.rating, game.ratingSource)}
                  </span>
                  <span className="text-zinc-500">
                    {" "}
                    · {formatRatingSourceLabel(game.ratingSource)}
                  </span>
                </p>
              ) : null}
            </div>

            <dl className="grid grid-cols-2 gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-4 dark:border-zinc-800 dark:bg-zinc-900/50">
              <MetaItem
                label="Best price"
                value={`€${game.minPriceEur.toFixed(2)}`}
              />
              {onSale ? (
                <MetaItem
                  label="Was"
                  value={`€${lead.originalPriceEur.toFixed(2)}`}
                />
              ) : (
                <MetaItem label="Store" value={lead.storeName} />
              )}
              {platforms.length > 0 ? (
                <MetaItem label="Platform" value={platforms.join(", ")} />
              ) : (
                <MetaItem label="Offers" value={String(game.offerCount)} />
              )}
              {game.sourceReleaseDate ? (
                <MetaItem label="Release" value={game.sourceReleaseDate} />
              ) : (
                <MetaItem
                  label="Stores"
                  value={String(game.offerCount)}
                />
              )}
            </dl>

            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Where to buy
              </h2>
              <ul className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
                {game.offers.map((offer, index) => {
                  const offerOnSale = offer.originalPriceEur > offer.priceEur;
                  return (
                    <li
                      key={offer.id}
                      className="flex flex-col gap-3 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:bg-zinc-950"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">
                          {offer.storeName}
                          {index === 0 ? (
                            <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              Cheapest
                            </span>
                          ) : null}
                        </span>
                        {offerOnSale ? (
                          <span className="text-xs text-zinc-500">
                            Was €{offer.originalPriceEur.toFixed(2)}
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-semibold tabular-nums">
                          €{offer.priceEur.toFixed(2)}
                        </span>
                        <a
                          href={offer.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-9 items-center rounded-full border border-zinc-200 px-4 text-xs font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
                        >
                          View deal →
                        </a>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                About
              </h2>
              {game.description ? (
                <p className="max-w-prose text-base leading-7 text-zinc-700 dark:text-zinc-300">
                  {game.description}
                </p>
              ) : (
                <p className="text-sm text-zinc-500 italic">
                  No description available for this game.
                </p>
              )}
            </section>
          </div>
        </div>

        {game.screenshotUrls.length > 0 ? (
          <section className="border-t border-zinc-200 p-6 sm:p-8 dark:border-zinc-800">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Screenshots
            </h2>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {game.screenshotUrls.slice(0, 6).map((url) => (
                <li
                  key={url}
                  className="relative aspect-video overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <DealImage src={url} alt="" fill />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </article>
    </div>
  );
}
