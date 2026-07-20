import { runSourceCron } from "@/lib/cron/run-source-cron";
import { fetchDeals } from "@/lib/sources/cheapshark/fetch-deals";

export async function GET(request: Request): Promise<Response> {
  return runSourceCron(request, {
    source: "cheapshark",
    fetchDeals,
    notifyWishlist: true,
  });
}
