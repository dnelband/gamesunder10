"use client";

import Link from "next/link";
import type { MouseEvent } from "react";

import {
  filtersToSearchParams,
  type DealListFilters,
} from "@/lib/deals/filters";

import { useDealsNav } from "./deals-nav";

interface DealPaginationProps {
  filters: DealListFilters;
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
}

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

export function DealPagination({
  filters,
  page,
  totalPages,
  total,
  pageSize,
}: DealPaginationProps) {
  const { navigate, isPending } = useDealsNav();

  if (totalPages <= 1) {
    return null;
  }

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const pages = pageWindow(page, totalPages);

  const linkClass =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-zinc-200 px-3 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900";
  const activeClass =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-foreground px-3 text-sm font-semibold text-background";
  const disabledClass =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-zinc-100 px-3 text-sm text-zinc-400 dark:border-zinc-800";

  function onNavigate(event: MouseEvent<HTMLAnchorElement>, href: string) {
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
    <nav
      className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between"
      aria-label="Pagination"
      aria-busy={isPending}
    >
      <p className="text-sm text-zinc-500">
        {from}–{to} of {total}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {page > 1 ? (
          <Link
            href={pageHref(filters, page - 1)}
            prefetch
            onClick={(event) =>
              onNavigate(event, pageHref(filters, page - 1))
            }
            className={linkClass}
            aria-disabled={isPending}
            tabIndex={isPending ? -1 : undefined}
          >
            Previous
          </Link>
        ) : (
          <span className={disabledClass}>Previous</span>
        )}

        {pages[0] > 1 ? (
          <>
            <Link
              href={pageHref(filters, 1)}
              prefetch
              onClick={(event) => onNavigate(event, pageHref(filters, 1))}
              className={linkClass}
              aria-disabled={isPending}
              tabIndex={isPending ? -1 : undefined}
            >
              1
            </Link>
            {pages[0] > 2 ? (
              <span className="px-1 text-zinc-400" aria-hidden>
                …
              </span>
            ) : null}
          </>
        ) : null}

        {pages.map((pageNumber) =>
          pageNumber === page ? (
            <span key={pageNumber} className={activeClass} aria-current="page">
              {pageNumber}
            </span>
          ) : (
            <Link
              key={pageNumber}
              href={pageHref(filters, pageNumber)}
              prefetch
              onClick={(event) =>
                onNavigate(event, pageHref(filters, pageNumber))
              }
              className={linkClass}
              aria-disabled={isPending}
              tabIndex={isPending ? -1 : undefined}
            >
              {pageNumber}
            </Link>
          ),
        )}

        {pages[pages.length - 1] < totalPages ? (
          <>
            {pages[pages.length - 1] < totalPages - 1 ? (
              <span className="px-1 text-zinc-400" aria-hidden>
                …
              </span>
            ) : null}
            <Link
              href={pageHref(filters, totalPages)}
              prefetch
              onClick={(event) =>
                onNavigate(event, pageHref(filters, totalPages))
              }
              className={linkClass}
              aria-disabled={isPending}
              tabIndex={isPending ? -1 : undefined}
            >
              {totalPages}
            </Link>
          </>
        ) : null}

        {page < totalPages ? (
          <Link
            href={pageHref(filters, page + 1)}
            prefetch
            onClick={(event) =>
              onNavigate(event, pageHref(filters, page + 1))
            }
            className={linkClass}
            aria-disabled={isPending}
            tabIndex={isPending ? -1 : undefined}
          >
            Next
          </Link>
        ) : (
          <span className={disabledClass}>Next</span>
        )}
      </div>
    </nav>
  );
}
