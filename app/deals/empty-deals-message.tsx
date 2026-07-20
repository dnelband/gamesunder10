import type { IgdbSearchCandidate } from "@/lib/enrichment/igdb-wishlist-search";

import { EmptyDealsWishlistSuggestions } from "./empty-deals-wishlist-suggestions";

export function EmptyDealsMessage({
  searchQuery,
  wishlistSuggestions = [],
  wishlistedIgdbIds = [],
}: {
  searchQuery?: string;
  wishlistSuggestions?: IgdbSearchCandidate[];
  wishlistedIgdbIds?: number[];
}) {
  const q = searchQuery?.trim() ?? "";

  return (
    <>
      <p className="font-display text-lg font-semibold text-fg">
        Nothing under 10€.
      </p>
      <p className="mt-2 text-sm text-muted">
        Beggers cant be choosers after all!
      </p>
      {q ? (
        <EmptyDealsWishlistSuggestions
          suggestions={wishlistSuggestions}
          wishlistedIgdbIds={wishlistedIgdbIds}
        />
      ) : null}
    </>
  );
}
