import Link from "next/link";

import {
  formatRatingBadgeValue,
  formatRatingLabel,
  formatRatingSourceLabel,
  getScoreBadgeClass,
} from "@/lib/format-rating";
import { sortPlatforms } from "@/lib/format-platform";
import type { NormalizedDeal } from "@/types/deal";

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

export function DealDetail({ deal }: { deal: NormalizedDeal }) {
  const heroImageUrl = deal.coverUrl ?? deal.imageUrl;
  const platforms = sortPlatforms(deal.platforms);
  const onSale = deal.originalPriceEur > deal.priceEur;
  const savingsEur = onSale
    ? Math.round((deal.originalPriceEur - deal.priceEur) * 100) / 100
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
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={heroImageUrl}
                alt=""
                className="h-full w-full object-cover"
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
                €{deal.priceEur.toFixed(2)}
              </span>
              {onSale ? (
                <span className="text-sm text-zinc-500 line-through">
                  €{deal.originalPriceEur.toFixed(2)}
                </span>
              ) : null}
            </div>

            {deal.rating !== null && deal.ratingSource ? (
              <div
                className={`absolute right-3 bottom-3 flex min-w-11 items-center justify-center rounded-md px-2.5 py-2 text-xl font-bold leading-none shadow-sm ${getScoreBadgeClass(deal.rating, deal.ratingSource)}`}
              >
                {formatRatingBadgeValue(deal.rating, deal.ratingSource)}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-6 p-6 sm:p-8">
            <header className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {onSale && deal.discountPercent > 0 ? (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    −{deal.discountPercent}%
                  </span>
                ) : null}
                {onSale && savingsEur > 0 ? (
                  <span className="text-xs text-zinc-500">
                    Save €{savingsEur.toFixed(2)}
                  </span>
                ) : null}
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                {deal.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500">
                <span>{deal.storeName}</span>
                {deal.region ? (
                  <>
                    <span aria-hidden>·</span>
                    <span>{deal.region}</span>
                  </>
                ) : null}
                {deal.sourceReleaseDate ? (
                  <>
                    <span aria-hidden>·</span>
                    <span>{deal.sourceReleaseDate.slice(0, 4)}</span>
                  </>
                ) : null}
              </div>

              {deal.genres.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {deal.genres.map((genre) => (
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
                href={deal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-8 text-sm font-semibold text-background transition-opacity hover:opacity-90"
              >
                View on {deal.storeName}
              </a>
              {deal.rating !== null && deal.ratingSource ? (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="font-medium text-foreground">
                    {formatRatingLabel(deal.rating, deal.ratingSource)}
                  </span>
                  <span className="text-zinc-500">
                    {" "}
                    · {formatRatingSourceLabel(deal.ratingSource)}
                  </span>
                </p>
              ) : null}
            </div>

            <dl className="grid grid-cols-2 gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-4 dark:border-zinc-800 dark:bg-zinc-900/50">
              <MetaItem label="Price" value={`€${deal.priceEur.toFixed(2)}`} />
              {onSale ? (
                <MetaItem
                  label="Was"
                  value={`€${deal.originalPriceEur.toFixed(2)}`}
                />
              ) : (
                <MetaItem label="Store" value={deal.storeName} />
              )}
              {platforms.length > 0 ? (
                <MetaItem label="Platform" value={platforms.join(", ")} />
              ) : (
                <MetaItem label="Source" value={deal.source.toUpperCase()} />
              )}
              {deal.sourceReleaseDate ? (
                <MetaItem label="Release" value={deal.sourceReleaseDate} />
              ) : deal.region ? (
                <MetaItem label="Region" value={deal.region} />
              ) : (
                <MetaItem
                  label="Currency"
                  value={deal.currencyOriginal}
                />
              )}
            </dl>

            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                About
              </h2>
              {deal.description ? (
                <p className="max-w-prose text-base leading-7 text-zinc-700 dark:text-zinc-300">
                  {deal.description}
                </p>
              ) : (
                <p className="text-sm text-zinc-500 italic">
                  No description available for this listing.
                </p>
              )}
            </section>
          </div>
        </div>

        {deal.screenshotUrls.length > 0 ? (
          <section className="border-t border-zinc-200 p-6 sm:p-8 dark:border-zinc-800">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Screenshots
            </h2>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {deal.screenshotUrls.slice(0, 6).map((url) => (
                <li
                  key={url}
                  className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    className="aspect-video w-full object-cover"
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </article>
    </div>
  );
}
