import { revalidateTag } from "next/cache";

import { isAuthorizedCronRequest } from "@/lib/cron/auth";
import { upsertDeals } from "@/lib/db/deals";
import { recordSourceRun } from "@/lib/db/source-health";
import { enrichDealsFromIgdb } from "@/lib/enrichment/enrich-deals-from-igdb";
import { fetchDeals } from "@/lib/sources/cheapshark/fetch-deals";

export async function GET(request: Request): Promise<Response> {
  if (!isAuthorizedCronRequest(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rawDeals = await fetchDeals();
    const deals = await enrichDealsFromIgdb(rawDeals);
    const count = await upsertDeals(deals);
    await recordSourceRun("cheapshark", {
      success: true,
      dealsIngested: count,
    });
    revalidateTag("deals", "max");

    return Response.json({ ok: true, source: "cheapshark", dealsIngested: count });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await recordSourceRun("cheapshark", { success: false, error: message });
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
