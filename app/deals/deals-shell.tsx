"use client";

import type { ReactNode } from "react";

import type { DealListFilters } from "@/lib/deals/filters";

import { DealFilters } from "./deal-filters";
import { DealsGridSkeleton } from "./deals-grid-skeleton";
import { DealsNavProvider, useDealsNav } from "./deals-nav";

interface DealsShellProps {
  initialFilters: DealListFilters;
  availableGenres: string[];
  availablePlatforms: string[];
  children: ReactNode;
}

function DealsShellInner({
  initialFilters,
  availableGenres,
  availablePlatforms,
  children,
}: DealsShellProps) {
  const { isPending } = useDealsNav();

  return (
    <>
      <DealFilters
        initialFilters={initialFilters}
        availableGenres={availableGenres}
        availablePlatforms={availablePlatforms}
      />

      <div aria-busy={isPending}>
        {isPending ? <DealsGridSkeleton /> : children}
      </div>
    </>
  );
}

export function DealsShell(props: DealsShellProps) {
  return (
    <DealsNavProvider>
      <DealsShellInner {...props} />
    </DealsNavProvider>
  );
}
