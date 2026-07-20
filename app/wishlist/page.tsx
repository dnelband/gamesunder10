import { connection } from "next/server";
import { Suspense } from "react";
import { redirect } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import {
  findDealMatchesForWishlist,
  listWishlistItems,
} from "@/lib/db/wishlists";
import { searchGamesForWishlist } from "@/lib/enrichment/igdb-wishlist-search";
import { effectiveSearchQuery } from "@/lib/search-query";
import { createClient } from "@/lib/supabase/server";

import { WishlistGrid, WishlistSearch } from "./wishlist-client";

export default function WishlistPage(props: PageProps<"/wishlist">) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6">
      <SiteHeader size="sm" />
      <Suspense
        fallback={<div className="text-muted">Loading wishlist…</div>}
      >
        <WishlistContent {...props} />
      </Suspense>
    </div>
  );
}

async function WishlistContent(props: PageProps<"/wishlist">) {
  await connection();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/wishlist");
  }

  const searchParams = await props.searchParams;
  const qRaw = searchParams.q;
  const q = effectiveSearchQuery(Array.isArray(qRaw) ? qRaw[0] : qRaw);

  const [items, searchResults] = await Promise.all([
    listWishlistItems(user.id),
    q ? searchGamesForWishlist(q) : Promise.resolve([]),
  ]);
  const matches = await findDealMatchesForWishlist(items);

  return (
    <>
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-fg">
          Wishlist
        </h1>
        <p className="text-muted">
          Track games that are not under €10 yet — including unreleased titles.
          When a deal appears, it shows up here.
        </p>
      </header>

      <WishlistSearch initialQuery={q} initialResults={searchResults} />

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold text-fg">
          Your list
          {items.length > 0 ? (
            <span className="ml-2 text-base font-normal text-muted">
              ({items.length})
            </span>
          ) : null}
        </h2>
        <WishlistGrid items={items} matches={matches} />
      </section>
    </>
  );
}
