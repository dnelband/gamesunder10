import { revalidateTag } from "next/cache";

import { isAuthorizedCronRequest } from "@/lib/cron/auth";
import { syncSourceDeals } from "@/lib/db/deals";
import { recordSourceRun } from "@/lib/db/source-health";
import { enrichDealsFromIgdb } from "@/lib/enrichment/enrich-deals-from-igdb";
import { fetchDeals } from "@/lib/sources/ebay/fetch-deals";

export async function GET(request: Request): Promise<Response> {
  if (!isAuthorizedCronRequest(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rawDeals = await fetchDeals();
    const deals = await enrichDealsFromIgdb(rawDeals);
    const { upserted, deleted } = await syncSourceDeals("ebay", deals);
    await recordSourceRun("ebay", {
      success: true,
      dealsIngested: upserted,
    });
    revalidateTag("deals", "max");

    return Response.json({
      ok: true,
      source: "ebay",
      dealsIngested: upserted,
      dealsDeleted: deleted,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await recordSourceRun("ebay", { success: false, error: message });
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
