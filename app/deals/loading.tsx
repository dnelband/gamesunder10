import { BrandWordmark } from "@/components/brand-wordmark";

import {
  DealFiltersSkeleton,
  DealsGridSkeleton,
} from "./deals-grid-skeleton";

export default function DealsLoading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header>
        <BrandWordmark size="lg" />
      </header>
      <div className="flex flex-col gap-6">
        <DealFiltersSkeleton />
        <DealsGridSkeleton />
      </div>
    </div>
  );
}
