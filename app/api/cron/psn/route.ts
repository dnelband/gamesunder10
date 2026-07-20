import { runSourceCron } from "@/lib/cron/run-source-cron";
import { fetchDeals } from "@/lib/sources/psn/fetch-deals";

export async function GET(request: Request): Promise<Response> {
  return runSourceCron(request, {
    source: "psn",
    fetchDeals,
    notifyWishlist: true,
  });
}
