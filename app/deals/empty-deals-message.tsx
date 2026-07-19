import Link from "next/link";

export function EmptyDealsMessage({ searchQuery }: { searchQuery?: string }) {
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
        <p className="mt-4 text-sm text-muted">
          No deals match “{q}”.{" "}
          <Link
            href={`/wishlist?q=${encodeURIComponent(q)}`}
            className="font-semibold text-accent underline-offset-2 hover:underline"
          >
            Add to wishlist
          </Link>{" "}
          to watch for a future price drop (released or unreleased).
        </p>
      ) : null}
    </>
  );
}
