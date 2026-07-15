import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { getCachedDealById } from "@/lib/db/deals-cached";
import {
  formatRatingLabel,
  formatRatingSourceLabel,
} from "@/lib/format-rating";
import { getGameMetadata } from "@/lib/enrichment/get-game-metadata";

function DealDetailFallback() {
  return (
    <div className="mx-auto px-6 py-12 text-zinc-600 dark:text-zinc-400">
      Loading deal…
    </div>
  );
}

export default function DealDetailPage(props: PageProps<"/deals/[id]">) {
  return (
    <Suspense fallback={<DealDetailFallback />}>
      <DealDetailContent {...props} />
    </Suspense>
  );
}

async function DealDetailContent(props: PageProps<"/deals/[id]">) {
  await connection();
  const { id } = await props.params;
  const deal = await getCachedDealById(id);

  if (!deal) {
    notFound();
  }

  const metadata = deal.steamAppId
    ? await getGameMetadata(deal.steamAppId)
    : null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <Link href="/deals" className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">
        ← All deals
      </Link>

      <header className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">{deal.title}</h1>
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="font-semibold">€{deal.priceEur.toFixed(2)}</span>
          <span className="text-zinc-500 line-through">
            €{deal.originalPriceEur.toFixed(2)}
          </span>
          <span className="text-zinc-500">{deal.storeName}</span>
          <span className="text-zinc-500">{deal.source}</span>
          {deal.rating !== null && deal.ratingSource ? (
            <span className="text-zinc-600 dark:text-zinc-400">
              {formatRatingSourceLabel(deal.ratingSource)}{" "}
              {formatRatingLabel(deal.rating, deal.ratingSource)}
            </span>
          ) : null}
        </div>
        {deal.genres.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {deal.genres.map((genre) => (
              <span
                key={genre}
                className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                {genre}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      {(metadata?.coverUrl ?? deal.imageUrl) ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={metadata?.coverUrl ?? deal.imageUrl ?? ""}
          alt=""
          className="w-full max-w-md rounded-lg object-cover"
        />
      ) : null}

      {metadata?.description ? (
        <p className="leading-7 text-zinc-700 dark:text-zinc-300">
          {metadata.description}
        </p>
      ) : null}

      {deal.sourceReleaseDate ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Release: {deal.sourceReleaseDate}
        </p>
      ) : null}

      <a
        href={deal.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-11 w-fit items-center rounded-full bg-foreground px-6 text-sm font-medium text-background"
      >
        View in store
      </a>
    </div>
  );
}
