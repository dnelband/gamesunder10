import { revalidateTag } from "next/cache";

import { isAuthorizedCronRequest } from "@/lib/cron/auth";
import { syncSourceDeals } from "@/lib/db/deals";
import { recordSourceRun } from "@/lib/db/source-health";
import { enrichDealsFromIgdb } from "@/lib/enrichment/enrich-deals-from-igdb";
import { fetchDeals } from "@/lib/sources/psn/fetch-deals";
import { runWishlistNotificationsSafe } from "@/lib/wishlist/run-after-cron";

export async function GET(request: Request): Promise<Response> {
  if (!isAuthorizedCronRequest(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rawDeals = await fetchDeals();
    const deals = await enrichDealsFromIgdb(rawDeals);
    const { upserted, deleted } = await syncSourceDeals("psn", deals);
    await recordSourceRun("psn", {
      success: true,
      dealsIngested: upserted,
    });
    revalidateTag("deals", "max");

    const wishlistNotify = await runWishlistNotificationsSafe();

    return Response.json({
      ok: true,
      source: "psn",
      dealsIngested: upserted,
      dealsDeleted: deleted,
      wishlistNotify,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await recordSourceRun("psn", { success: false, error: message });
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
