import { runSourceCron } from "@/lib/cron/run-source-cron";
import { fetchDeals } from "@/lib/sources/xbox/fetch-deals";

export async function GET(request: Request): Promise<Response> {
  return runSourceCron(request, {
    source: "xbox",
    fetchDeals,
    notifyWishlist: true,
  });
}
