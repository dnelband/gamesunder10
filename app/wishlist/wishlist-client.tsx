"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import {
  addToWishlistAction,
  removeFromWishlistAction,
} from "@/app/wishlist/actions";
import { GenreTags, releaseLabel, WishlistSuggestionTitleRow } from "@/app/wishlist/wishlist-suggestion-meta";
import type { IgdbSearchCandidate } from "@/lib/enrichment/igdb-wishlist-search";
import { igdbGamePageUrl } from "@/lib/enrichment/igdb-client";
import type { WishlistDealMatch, WishlistItem } from "@/lib/db/wishlists";
import { effectiveSearchQuery } from "@/lib/search-query";

const SEARCH_DEBOUNCE_MS = 500;

export function WishlistSearch({
  initialQuery,
  initialResults,
}: {
  initialQuery: string;
  initialResults: IgdbSearchCandidate[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<number | null>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const effectiveQ = effectiveSearchQuery(query);
    if (effectiveQ === initialQuery) {
      return;
    }

    const timer = setTimeout(() => {
      startTransition(() => {
        router.push(
          effectiveQ ? `/wishlist?q=${encodeURIComponent(effectiveQ)}` : "/wishlist",
        );
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query, initialQuery, router]);

  function onQueryChange(value: string) {
    setQuery(value);
    setError(null);
  }

  async function onAdd(candidate: IgdbSearchCandidate) {
    setError(null);
    setAddingId(candidate.igdbId);
    const result = await addToWishlistAction({
      igdbId: candidate.igdbId,
      title: candidate.title,
      coverUrl: candidate.coverUrl,
      releaseDate: candidate.releaseDate,
      steamAppId: candidate.steamAppId,
    });
    setAddingId(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    startTransition(() => {
      router.refresh();
    });
  }

  const effectiveQuery = effectiveSearchQuery(query);
  const activeSearch = initialQuery.length > 0;
  const isSearching = pending || effectiveQuery !== initialQuery;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl font-semibold text-fg">
          Find a game
        </h2>
        <p className="text-sm text-muted">
          Wishlist is for titles that are not in deals yet (including
          unreleased). Start typing to search IGDB.
        </p>
      </div>

      <input
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Game title…"
        className="h-11 w-full rounded-md border border-stroke bg-surface px-3 text-fg outline-none focus:border-muted"
      />

      {error ? (
        <p className="rounded-md border border-stroke bg-surface px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}

      {isSearching ? (
        <p className="text-sm text-muted">Searching…</p>
      ) : null}

      {activeSearch && initialResults.length === 0 ? (
        <p className="text-sm text-muted">No IGDB matches for “{initialQuery}”.</p>
      ) : null}

      {activeSearch && initialResults.length > 0 ? (
        <ul className="divide-y divide-stroke rounded-lg border border-stroke">
          {initialResults.map((candidate) => (
            <li
              key={candidate.igdbId}
              className="flex items-center gap-3 px-3 py-2.5"
            >
              <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded bg-surface-2">
                {candidate.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- IGDB CDN
                  <img
                    src={candidate.coverUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <WishlistSuggestionTitleRow
                  title={candidate.title}
                  releaseDate={candidate.releaseDate}
                  href={igdbGamePageUrl(candidate)}
                />
                <GenreTags genres={candidate.genres} />
              </div>
              <button
                type="button"
                disabled={addingId === candidate.igdbId}
                onClick={() => onAdd(candidate)}
                className="shrink-0 rounded-md border border-stroke px-3 py-1.5 text-xs font-semibold text-fg transition-colors hover:bg-surface-2 disabled:opacity-50"
              >
                {addingId === candidate.igdbId ? "Adding…" : "Add"}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export function WishlistGrid({
  items,
  matches,
}: {
  items: WishlistItem[];
  matches: Record<number, WishlistDealMatch | null>;
}) {
  const router = useRouter();
  const [removingId, setRemovingId] = useState<number | null>(null);

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-stroke bg-surface px-4 py-10 text-center">
        <p className="font-display text-lg font-semibold text-fg">
          Wishlist is empty
        </p>
        <p className="mt-2 text-sm text-muted">
          Search above for a game that is not under €10 yet.
        </p>
      </div>
    );
  }

  async function onRemove(igdbId: number) {
    setRemovingId(igdbId);
    await removeFromWishlistAction(igdbId);
    setRemovingId(null);
    router.refresh();
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {items.map((item) => {
        const match = matches[item.igdbId] ?? null;
        return (
          <li
            key={item.id}
            className="flex flex-col overflow-hidden rounded-lg border border-stroke bg-surface"
          >
            <div className="relative aspect-[3/4] bg-surface-2">
              {item.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- IGDB CDN
                <img
                  src={item.coverUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted">
                  No art
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-3">
              <p className="line-clamp-2 text-sm font-semibold text-fg">
                {item.title}
              </p>
              <p className="text-xs text-muted">
                {releaseLabel(item.releaseDate)}
              </p>
              {match ? (
                <Link
                  href={`/deals/${encodeURIComponent(match.groupKey)}`}
                  className="text-xs font-semibold text-price"
                >
                  Now €{match.minPriceEur.toFixed(2)} →
                </Link>
              ) : (
                <span className="text-xs text-muted">Watching</span>
              )}
              <button
                type="button"
                disabled={removingId === item.igdbId}
                onClick={() => onRemove(item.igdbId)}
                className="mt-auto text-left text-xs text-muted transition-colors hover:text-fg disabled:opacity-50"
              >
                {removingId === item.igdbId ? "Removing…" : "Remove"}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
