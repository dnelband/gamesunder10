"use client";

import type { ReactNode } from "react";

import type { DealListFilters } from "@/lib/deals/filters";

import { DealFilters } from "./deal-filters";
import { DealsNavProvider, useDealsNav } from "./deals-nav";

interface DealsShellProps {
  initialFilters: DealListFilters;
  availableGenres: string[];
  availablePlatforms: string[];
  summary: ReactNode;
  children: ReactNode;
}

function DealsShellInner({
  initialFilters,
  availableGenres,
  availablePlatforms,
  summary,
  children,
}: DealsShellProps) {
  const { isPending } = useDealsNav();

  return (
    <div className="flex flex-col gap-6">
      <DealFilters
        initialFilters={initialFilters}
        availableGenres={availableGenres}
        availablePlatforms={availablePlatforms}
        summary={summary}
      />

      <div
        aria-busy={isPending}
        className={
          isPending
            ? "pointer-events-none opacity-50 transition-opacity duration-150"
            : "transition-opacity duration-150"
        }
      >
        {children}
      </div>
    </div>
  );
}

export function DealsShell(props: DealsShellProps) {
  return (
    <DealsNavProvider>
      <DealsShellInner {...props} />
    </DealsNavProvider>
  );
}
