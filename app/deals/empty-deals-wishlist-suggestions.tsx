"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import {
  addToWishlistAction,
  removeFromWishlistAction,
} from "@/app/wishlist/actions";
import { GenreTags, WishlistSuggestionTitleRow } from "@/app/wishlist/wishlist-suggestion-meta";
import type { IgdbSearchCandidate } from "@/lib/enrichment/igdb-wishlist-search";
import { igdbGamePageUrl } from "@/lib/enrichment/igdb-client";

export function EmptyDealsWishlistSuggestions({
  suggestions,
  wishlistedIgdbIds,
}: {
  suggestions: IgdbSearchCandidate[];
  wishlistedIgdbIds: number[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [addedIds, setAddedIds] = useState<number[]>([]);
  const [removedIds, setRemovedIds] = useState<number[]>([]);
  const [, startTransition] = useTransition();

  const wishlistedIds = useMemo(() => {
    const ids = new Set([...wishlistedIgdbIds, ...addedIds]);
    for (const id of removedIds) {
      ids.delete(id);
    }
    return ids;
  }, [wishlistedIgdbIds, addedIds, removedIds]);

  async function onAdd(candidate: IgdbSearchCandidate) {
    setError(null);
    setBusyId(candidate.igdbId);
    const result = await addToWishlistAction({
      igdbId: candidate.igdbId,
      title: candidate.title,
      coverUrl: candidate.coverUrl,
      releaseDate: candidate.releaseDate,
      steamAppId: candidate.steamAppId,
    });
    setBusyId(null);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setRemovedIds((current) =>
      current.filter((id) => id !== candidate.igdbId),
    );
    setAddedIds((current) =>
      current.includes(candidate.igdbId)
        ? current
        : [...current, candidate.igdbId],
    );

    startTransition(() => {
      router.refresh();
    });
  }

  async function onRemove(igdbId: number) {
    setError(null);
    setBusyId(igdbId);
    const result = await removeFromWishlistAction(igdbId);
    setBusyId(null);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setAddedIds((current) => current.filter((id) => id !== igdbId));
    setRemovedIds((current) =>
      current.includes(igdbId) ? current : [...current, igdbId],
    );

    startTransition(() => {
      router.refresh();
    });
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mt-5 text-left">
      <p className="text-sm font-semibold text-fg">Add to wishlist</p>
      <p className="mt-1 text-sm text-muted">
        Similar titles from IGDB are ready below.
      </p>

      {error ? (
        <p className="mt-3 rounded-md border border-stroke bg-surface px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <ul className="mt-4 divide-y divide-stroke overflow-hidden rounded-lg border border-stroke bg-bg">
        {suggestions.map((candidate) => {
          const isWishlisted = wishlistedIds.has(candidate.igdbId);
          const isBusy = busyId === candidate.igdbId;

          return (
            <li
              key={candidate.igdbId}
              className="flex items-center gap-3 px-3 py-3"
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
                onClick={() =>
                  isWishlisted
                    ? onRemove(candidate.igdbId)
                    : onAdd(candidate)
                }
                disabled={isBusy}
                className="shrink-0 cursor-pointer rounded-md border border-stroke px-3 py-1.5 text-xs font-semibold text-fg transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isBusy
                  ? isWishlisted
                    ? "Removing..."
                    : "Adding..."
                  : isWishlisted
                    ? "Remove"
                    : "Add"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
