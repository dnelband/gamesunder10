import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { getCachedGameOfferByGroupKey } from "@/lib/db/deals-cached";
import { parseGroupKey } from "@/lib/deals/grouping";

import { GameOfferDetailView } from "./deal-detail";

function DealDetailFallback() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 py-8 sm:px-6 sm:py-10">
      <div className="h-7 w-36 animate-pulse rounded bg-surface-2" />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] lg:gap-12">
        <div className="aspect-[3/4] animate-pulse rounded-lg bg-surface-2" />
        <div className="flex flex-col justify-center gap-4">
          <div className="h-4 w-40 animate-pulse rounded bg-surface-2" />
          <div className="h-12 w-3/4 animate-pulse rounded bg-surface-2" />
          <div className="h-10 w-32 animate-pulse rounded bg-surface-2" />
        </div>
      </div>
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
