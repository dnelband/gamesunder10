import { BrandWordmark } from "@/components/brand-wordmark";

import {
  DealFiltersSkeleton,
  DealsGridSkeleton,
  DealsSummarySkeleton,
} from "./deals-grid-skeleton";

export default function DealsLoading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header>
        <BrandWordmark size="lg" />
      </header>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <DealFiltersSkeleton />
          <DealsSummarySkeleton />
        </div>
        <DealsGridSkeleton />
      </div>
    </div>
  );
}
