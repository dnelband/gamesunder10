import { notifyWishlistDealMatches } from "@/lib/wishlist/notify-deals";

/**
 * Fire-and-log wishlist emails after a successful source sync.
 * Failures here must never fail the cron response.
 */
export async function runWishlistNotificationsSafe(): Promise<
  Awaited<ReturnType<typeof notifyWishlistDealMatches>> | null
> {
  try {
    const result = await notifyWishlistDealMatches();
    if (result.skippedReason) {
      console.warn("[wishlist-notify] skipped:", result.skippedReason);
    } else if (result.scanned > 0 || result.notified > 0) {
      console.warn("[wishlist-notify]", result);
    }
    return result;
  } catch (err) {
    console.error("[wishlist-notify] unexpected failure", err);
    return null;
  }
}
