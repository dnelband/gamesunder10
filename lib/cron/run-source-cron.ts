import { revalidateTag } from "next/cache";

import { isAuthorizedCronRequest } from "@/lib/cron/auth";
import { syncSourceDeals } from "@/lib/db/deals";
import { recordSourceRun } from "@/lib/db/source-health";
import { enrichDealsFromIgdb } from "@/lib/enrichment/enrich-deals-from-igdb";
import { runWishlistNotificationsSafe } from "@/lib/wishlist/run-after-cron";
import type { NormalizedDeal } from "@/types/deal";
import type { DealSource } from "@/types/deal-source";

export interface RunSourceCronOptions {
  source: DealSource;
  fetchDeals: () => Promise<NormalizedDeal[]>;
  /**
   * When true, run wishlist deal emails after a successful sync
   * (CheapShark / PSN / Xbox).
   */
  notifyWishlist?: boolean;
}

/**
 * Shared cron pipeline: auth → fetch → IGDB enrich → sync → health →
 * revalidate → optional wishlist notify. Each source keeps its own route so
 * failures stay isolated.
 */
export async function runSourceCron(
  request: Request,
  options: RunSourceCronOptions,
): Promise<Response> {
  if (!isAuthorizedCronRequest(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { source, fetchDeals, notifyWishlist = false } = options;

  try {
    const rawDeals = await fetchDeals();
    const deals = await enrichDealsFromIgdb(rawDeals);
    const { upserted, deleted } = await syncSourceDeals(source, deals);
    await recordSourceRun(source, {
      success: true,
      dealsIngested: upserted,
    });
    revalidateTag("deals", "max");

    const body: Record<string, unknown> = {
      ok: true,
      source,
      dealsIngested: upserted,
      dealsDeleted: deleted,
    };

    if (notifyWishlist) {
      body.wishlistNotify = await runWishlistNotificationsSafe();
    }

    return Response.json(body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await recordSourceRun(source, { success: false, error: message });
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
