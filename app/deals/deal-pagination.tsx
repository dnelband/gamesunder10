"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";

import {
  filtersToSearchParams,
  type DealListFilters,
} from "@/lib/deals/filters";
import { cn } from "@/lib/cn";

import { useDealsNav } from "./deals-nav";

interface DealPaginationProps {
  filters: DealListFilters;
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
}

const LINK_CLASS =
  "inline-flex h-10 min-w-10 items-center justify-center rounded-md border border-stroke px-3 text-sm font-medium text-fg transition-colors duration-150 hover:bg-surface-2";
const ACTIVE_CLASS =
  "inline-flex h-10 min-w-10 items-center justify-center rounded-md bg-accent px-3 text-sm font-semibold text-fg";
const DISABLED_CLASS =
  "inline-flex h-10 min-w-10 items-center justify-center rounded-md border border-stroke/50 px-3 text-sm text-muted/50";

function pageHref(filters: DealListFilters, page: number): string {
  const params = filtersToSearchParams(filters, page);
  const query = params.toString();
  return query ? `/deals?${query}` : "/deals";
}

function pageWindow(current: number, total: number): number[] {
  const radius = 2;
  const start = Math.max(1, current - radius);
  const end = Math.min(total, current + radius);
  const pages: number[] = [];
  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }
  return pages;
}

function Ellipsis() {
  return (
    <span className="px-1 text-muted" aria-hidden>
      …
    </span>
  );
}

function PageLink({
  href,
  isPending,
  children,
}: {
  href: string;
  isPending: boolean;
  children: ReactNode;
}) {
  const { navigate } = useDealsNav();

  function onNavigate(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    if (!isPending) {
      navigate(href);
    }
  }

  return (
    <Link
      href={href}
      prefetch
      onClick={onNavigate}
      className={LINK_CLASS}
      aria-disabled={isPending}
      tabIndex={isPending ? -1 : undefined}
    >
      {children}
    </Link>
  );
}

function PreviousNextLink({
  filters,
  targetPage,
  isPending,
  label,
  enabled,
}: {
  filters: DealListFilters;
  targetPage: number;
  isPending: boolean;
  label: string;
  enabled: boolean;
}) {
  if (!enabled) {
    return <span className={DISABLED_CLASS}>{label}</span>;
  }
  return (
    <PageLink href={pageHref(filters, targetPage)} isPending={isPending}>
      {label}
    </PageLink>
  );
}

function LeadingPageLinks({
  filters,
  pages,
  isPending,
}: {
  filters: DealListFilters;
  pages: number[];
  isPending: boolean;
}) {
  if (pages[0] <= 1) {
    return null;
  }
  return (
    <>
      <PageLink href={pageHref(filters, 1)} isPending={isPending}>
        1
      </PageLink>
      {pages[0] > 2 ? <Ellipsis /> : null}
    </>
  );
}

function TrailingPageLinks({
  filters,
  pages,
  totalPages,
  isPending,
}: {
  filters: DealListFilters;
  pages: number[];
  totalPages: number;
  isPending: boolean;
}) {
  const lastShown = pages[pages.length - 1];
  if (lastShown >= totalPages) {
    return null;
  }
  return (
    <>
      {lastShown < totalPages - 1 ? <Ellipsis /> : null}
      <PageLink href={pageHref(filters, totalPages)} isPending={isPending}>
        {totalPages}
      </PageLink>
    </>
  );
}

function PageNumberLinks({
  filters,
  pages,
  page,
  isPending,
}: {
  filters: DealListFilters;
  pages: number[];
  page: number;
  isPending: boolean;
}) {
  return (
    <>
      {pages.map((pageNumber) =>
        pageNumber === page ? (
          <span key={pageNumber} className={ACTIVE_CLASS} aria-current="page">
            {pageNumber}
          </span>
        ) : (
          <PageLink
            key={pageNumber}
            href={pageHref(filters, pageNumber)}
            isPending={isPending}
          >
            {pageNumber}
          </PageLink>
        ),
      )}
    </>
  );
}

function PaginationControls({
  filters,
  page,
  totalPages,
  isPending,
}: {
  filters: DealListFilters;
  page: number;
  totalPages: number;
  isPending: boolean;
}) {
  const pages = pageWindow(page, totalPages);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <PreviousNextLink
        filters={filters}
        targetPage={page - 1}
        isPending={isPending}
        label="Previous"
        enabled={page > 1}
      />

      <LeadingPageLinks filters={filters} pages={pages} isPending={isPending} />
      <PageNumberLinks
        filters={filters}
        pages={pages}
        page={page}
        isPending={isPending}
      />
      <TrailingPageLinks
        filters={filters}
        pages={pages}
        totalPages={totalPages}
        isPending={isPending}
      />

      <PreviousNextLink
        filters={filters}
        targetPage={page + 1}
        isPending={isPending}
        label="Next"
        enabled={page < totalPages}
      />
    </div>
  );
}

export function DealPagination({
  filters,
  page,
  totalPages,
  total,
  pageSize,
}: DealPaginationProps) {
  const { isPending } = useDealsNav();

  if (total === 0) {
    return null;
  }

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const showControls = totalPages > 1;

  return (
    <nav
      className={cn(
        "flex flex-col gap-3",
        showControls
          ? "items-center sm:flex-row sm:justify-between"
          : "items-start",
      )}
      aria-label="Pagination"
      aria-busy={isPending}
    >
      <p className="text-sm text-muted">
        {from}–{to} of {total.toLocaleString()} deal{total === 1 ? "" : "s"}
        {filters.store ? ` · ${filters.store}` : ""}
      </p>

      {showControls ? (
        <PaginationControls
          filters={filters}
          page={page}
          totalPages={totalPages}
          isPending={isPending}
        />
      ) : null}
    </nav>
  );
}
