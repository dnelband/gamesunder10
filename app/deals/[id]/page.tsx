import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { getCachedDealById } from "@/lib/db/deals-cached";

import { DealDetail } from "./deal-detail";

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
  const deal = await getCachedDealById(id);

  if (!deal) {
    notFound();
  }

  return <DealDetail deal={deal} />;
}
