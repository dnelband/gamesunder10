import Link from "next/link";
import { redirect } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";

export default async function WishlistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/wishlist");
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6">
      <SiteHeader size="sm" />

      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-fg">
          Wishlist
        </h1>
        <p className="text-muted">
          Save games you care about. Full wishlist is next — this page is a
          placeholder so the account menu has somewhere to go.
        </p>
      </header>

      <div className="rounded-lg border border-dashed border-stroke bg-surface px-4 py-10 text-center">
        <p className="font-display text-lg font-semibold text-fg">
          Nothing saved yet.
        </p>
        <p className="mt-2 text-sm text-muted">
          When wishlist lands, you&apos;ll pin deals from game pages here.
        </p>
        <Link
          href="/deals"
          className="mt-6 inline-flex h-10 items-center rounded-md bg-accent px-4 text-sm font-semibold text-fg transition-opacity hover:opacity-90"
        >
          Browse deals
        </Link>
      </div>
    </div>
  );
}
