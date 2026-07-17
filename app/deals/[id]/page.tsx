import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { getCachedGameOfferByGroupKey } from "@/lib/db/deals-cached";
import { parseGroupKey } from "@/lib/deals/grouping";

import { GameOfferDetailView } from "./deal-detail";

function DealDetailFallback() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="h-8 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-6 h-[480px] animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
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
  const groupKey = decodeURIComponent(id);

  if (!parseGroupKey(groupKey)) {
    notFound();
  }

  const game = await getCachedGameOfferByGroupKey(groupKey);

  if (!game) {
    notFound();
  }

  return <GameOfferDetailView game={game} />;
}
