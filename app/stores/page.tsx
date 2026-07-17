import Link from "next/link";
import { Suspense } from "react";

import { BrandWordmark } from "@/components/brand-wordmark";
import { listStoreDealStats } from "@/lib/db/store-stats";
import { dealsHrefForStore } from "@/lib/deals/filters";
import type { StoreUrlKind } from "@/lib/sources/cheapshark/store-url-kinds";

function builderBadgeClass(kind: StoreUrlKind): string {
  switch (kind) {
    case "product":
      return "bg-cut/15 text-cut";
    case "search":
      return "bg-price/20 text-price";
    default:
      return "bg-danger/15 text-danger";
  }
}

export default function StoresPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto px-6 py-12 text-muted">Loading stores…</div>
      }
    >
      <StoresContent />
    </Suspense>
  );
}

async function StoresContent() {
  const stats = await listStoreDealStats();
  const totalDeals = stats.reduce((sum, row) => sum + row.dealCount, 0);
  const product = stats.filter((row) => row.builder.kind === "product").length;
  const search = stats.filter((row) => row.builder.kind === "search").length;
  const omit = stats.filter((row) => row.builder.kind === "omit").length;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/deals" className="w-fit">
          <BrandWordmark size="sm" />
        </Link>
        <nav className="flex flex-wrap gap-4 text-sm text-muted">
          <Link href="/status" className="hover:text-fg">
            Status
          </Link>
          <Link href="/deals" className="hover:text-fg">
            Deals
          </Link>
        </nav>
      </div>

      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-fg">
          Stores
        </h1>
        <p className="text-muted">
          Live deal counts plus link-builder status from the registry. Prefer
          product deep links; fall back to store search when the product path
          needs an id we do not have (or no product builder yet).
        </p>
      </header>

      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-stroke bg-surface px-4 py-3">
          <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">
            Stores
          </dt>
          <dd className="mt-1 font-display text-2xl font-semibold text-fg">
            {stats.length}
          </dd>
        </div>
        <div className="rounded-lg border border-stroke bg-surface px-4 py-3">
          <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">
            Deals
          </dt>
          <dd className="mt-1 font-display text-2xl font-semibold text-fg">
            {totalDeals}
          </dd>
        </div>
        <div className="rounded-lg border border-stroke bg-surface px-4 py-3">
          <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">
            Product / search
          </dt>
          <dd className="mt-1 font-display text-2xl font-semibold text-fg">
            {product} / {search}
          </dd>
        </div>
        <div className="rounded-lg border border-stroke bg-surface px-4 py-3">
          <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">
            Omit
          </dt>
          <dd className="mt-1 font-display text-2xl font-semibold text-fg">
            {omit}
          </dd>
        </div>
      </dl>

      <div className="overflow-x-auto rounded-lg border border-stroke">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-surface text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Store</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium text-right">Deals</th>
              <th className="px-4 py-3 font-medium">Link builder</th>
              <th className="px-4 py-3 font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((row) => (
              <tr
                key={`${row.source}:${row.storeName}`}
                className="border-t border-stroke"
              >
                <td className="px-4 py-3 font-medium text-fg">
                  <Link
                    href={dealsHrefForStore(row.storeName)}
                    className="text-accent underline-offset-2 transition-colors hover:text-fg hover:underline"
                  >
                    {row.storeName}
                  </Link>
                </td>
                <td className="px-4 py-3 font-mono text-muted">{row.source}</td>
                <td className="px-4 py-3 text-right tabular-nums text-fg">
                  {row.dealCount}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-md px-2.5 py-0.5 text-xs font-semibold capitalize ${builderBadgeClass(row.builder.kind)}`}
                  >
                    {row.builder.label}
                  </span>
                </td>
                <td className="max-w-xs px-4 py-3 text-muted">
                  {row.builder.detail}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted">
        Ops-only page — not linked from public nav. Builder registry:{" "}
        <code className="rounded bg-surface-2 px-1">
          lib/sources/cheapshark/store-registry.ts
        </code>
      </p>
    </div>
  );
}
