import { connection } from "next/server";
import { Suspense } from "react";

import { getCachedDeals } from "@/lib/db/deals-cached";

import { DealCard } from "./deal-card";

function DealsFallback() {
  return (
    <div className="mx-auto px-6 py-12 text-zinc-600 dark:text-zinc-400">
      Loading deals…
    </div>
  );
}

export default function DealsPage() {
  return (
    <Suspense fallback={<DealsFallback />}>
      <DealsContent />
    </Suspense>
  );
}

async function DealsContent() {
  await connection();
  const deals = await getCachedDeals(50);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Deals under €10</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Sorted by original price (highest first), then release date (newest
          first). {deals.length} deals loaded.
        </p>
      </header>

      {deals.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-8 text-center text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          No deals yet. Run the CheapShark cron:{" "}
          <code className="font-mono text-sm">GET /api/cron/cheapshark</code>
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {deals.map((deal) => (
            <li key={deal.id}>
              <DealCard deal={deal} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
