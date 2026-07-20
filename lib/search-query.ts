export const MIN_SEARCH_QUERY_LENGTH = 2;

/** Debounce for deals + wishlist typeahead URL updates. */
export const SEARCH_DEBOUNCE_MS = 500;

export function effectiveSearchQuery(
  raw: string | null | undefined,
): string {
  const trimmed = (raw ?? "").trim();
  return trimmed.length >= MIN_SEARCH_QUERY_LENGTH ? trimmed : "";
}
