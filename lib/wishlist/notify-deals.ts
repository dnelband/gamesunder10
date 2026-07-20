import { Resend } from "resend";

import {
  explainWishlistDealMatchesForItems,
  listAllWishlistItems,
  markWishlistNotified,
  type WishlistDealMatch,
  type WishlistItem,
} from "@/lib/db/wishlists";
import { createAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin";

const PRICE_DROP_EPSILON = 0.01;

export type WishlistNotifyResult = {
  scanned: number;
  notified: number;
  skipped: number;
  errors: number;
  skippedReason?: string;
  detail?: {
    noMatch: number;
    alreadyNotifiedAtThisPrice: number;
    missingUserEmail: number;
    sendFailed: number;
  };
};

function siteBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.CRON_BASE_URL?.trim() ||
    "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

function shouldNotify(
  item: WishlistItem,
  match: WishlistDealMatch,
): boolean {
  if (item.lastNotifiedPriceEur == null || item.lastNotifiedAt == null) {
    return true;
  }
  return match.minPriceEur < item.lastNotifiedPriceEur - PRICE_DROP_EPSILON;
}

function formatPrice(eur: number): string {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(eur);
}

function buildEmailHtml(input: {
  title: string;
  priceEur: number;
  dealUrl: string;
  wishlistUrl: string;
}): string {
  const price = formatPrice(input.priceEur);
  return `<!DOCTYPE html>
<html>
  <body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
    <p><strong>${escapeHtml(input.title)}</strong> is now under €10 on Broke Gamer.</p>
    <p style="font-size: 1.25rem;">From <strong>${price}</strong></p>
    <p>
      <a href="${escapeAttr(input.dealUrl)}" style="color: #0b5fff;">View deal</a>
      ·
      <a href="${escapeAttr(input.wishlistUrl)}" style="color: #0b5fff;">Your wishlist</a>
    </p>
    <p style="color: #666; font-size: 0.875rem;">
      You’re getting this because you added this game to your wishlist.
      We’ll email again only if the price drops further.
    </p>
  </body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttr(value: string): string {
  return escapeHtml(value).replaceAll("'", "&#39;");
}

async function resolveUserEmail(
  userId: string,
  cache: Map<string, string | null>,
): Promise<string | null> {
  if (cache.has(userId)) {
    return cache.get(userId) ?? null;
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.getUserById(userId);
    if (error || !data.user?.email) {
      cache.set(userId, null);
      return null;
    }
    cache.set(userId, data.user.email);
    return data.user.email;
  } catch {
    cache.set(userId, null);
    return null;
  }
}

interface NotifyMailConfig {
  apiKey: string;
  from: string;
}

/** Missing mail/service config means a no-op result, not an error — see doc comment below. */
function resolveNotifyMailConfig(): NotifyMailConfig | WishlistNotifyResult {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();

  if (!apiKey || !from) {
    return {
      scanned: 0,
      notified: 0,
      skipped: 0,
      errors: 0,
      skippedReason: "RESEND_API_KEY or RESEND_FROM_EMAIL not set",
    };
  }

  if (!hasServiceRoleKey()) {
    return {
      scanned: 0,
      notified: 0,
      skipped: 0,
      errors: 0,
      skippedReason: "SUPABASE_SERVICE_ROLE_KEY not set",
    };
  }

  return { apiKey, from };
}

type NotifyOutcome =
  | "notified"
  | "noMatch"
  | "alreadyNotifiedAtThisPrice"
  | "missingUserEmail"
  | "sendFailed";

interface NotifyContext {
  resend: Resend;
  from: string;
  base: string;
  wishlistUrl: string;
  emailCache: Map<string, string | null>;
}

async function sendWishlistDealEmail(
  ctx: NotifyContext,
  item: WishlistItem,
  match: WishlistDealMatch,
  email: string,
): Promise<NotifyOutcome> {
  const dealUrl = `${ctx.base}/deals/${encodeURIComponent(match.groupKey)}`;
  const { error } = await ctx.resend.emails.send({
    from: ctx.from,
    to: email,
    subject: `${match.title} is under €10 — ${formatPrice(match.minPriceEur)}`,
    html: buildEmailHtml({
      title: match.title,
      priceEur: match.minPriceEur,
      dealUrl,
      wishlistUrl: ctx.wishlistUrl,
    }),
  });

  if (error) {
    console.error("[wishlist-notify] Resend error", error);
    return "sendFailed";
  }

  await markWishlistNotified(item.id, match.minPriceEur);
  return "notified";
}

async function processWishlistItem(
  ctx: NotifyContext,
  item: WishlistItem,
  match: WishlistDealMatch | null,
): Promise<NotifyOutcome> {
  try {
    if (!match) {
      return "noMatch";
    }
    if (!shouldNotify(item, match)) {
      return "alreadyNotifiedAtThisPrice";
    }

    const email = await resolveUserEmail(item.userId, ctx.emailCache);
    if (!email) {
      return "missingUserEmail";
    }

    return await sendWishlistDealEmail(ctx, item, match, email);
  } catch (err) {
    console.error("[wishlist-notify] item failed", item.id, err);
    return "sendFailed";
  }
}

interface NotifyCounts {
  notified: number;
  skipped: number;
  errors: number;
  noMatch: number;
  alreadyNotifiedAtThisPrice: number;
  missingUserEmail: number;
  sendFailed: number;
}

function applyNotifyOutcome(counts: NotifyCounts, outcome: NotifyOutcome): void {
  if (outcome === "notified") {
    counts.notified += 1;
    return;
  }
  if (outcome === "noMatch" || outcome === "alreadyNotifiedAtThisPrice") {
    counts.skipped += 1;
    counts[outcome] += 1;
    return;
  }
  counts.errors += 1;
  counts[outcome] += 1;
}

/**
 * After a successful deal sync: email users whose wishlist games now have
 * under-€10 deals (first match or a further price drop).
 *
 * No-ops when RESEND_API_KEY or SUPABASE_SERVICE_ROLE_KEY is missing so local
 * cron can run without mail config. Never throws — cron routes should stay green.
 */
export async function notifyWishlistDealMatches(): Promise<WishlistNotifyResult> {
  const mailConfig = resolveNotifyMailConfig();
  if (!("apiKey" in mailConfig)) {
    return mailConfig;
  }

  const items = await listAllWishlistItems();
  if (items.length === 0) {
    return { scanned: 0, notified: 0, skipped: 0, errors: 0 };
  }

  const base = siteBaseUrl();
  const ctx: NotifyContext = {
    resend: new Resend(mailConfig.apiKey),
    from: mailConfig.from,
    base,
    wishlistUrl: `${base}/wishlist`,
    emailCache: new Map(),
  };

  const counts: NotifyCounts = {
    notified: 0,
    skipped: 0,
    errors: 0,
    noMatch: 0,
    alreadyNotifiedAtThisPrice: 0,
    missingUserEmail: 0,
    sendFailed: 0,
  };

  const matchesById = await explainWishlistDealMatchesForItems(items);

  for (const item of items) {
    const outcome = await processWishlistItem(
      ctx,
      item,
      matchesById[item.id]?.match ?? null,
    );
    applyNotifyOutcome(counts, outcome);
  }

  return {
    scanned: items.length,
    notified: counts.notified,
    skipped: counts.skipped,
    errors: counts.errors,
    detail: {
      noMatch: counts.noMatch,
      alreadyNotifiedAtThisPrice: counts.alreadyNotifiedAtThisPrice,
      missingUserEmail: counts.missingUserEmail,
      sendFailed: counts.sendFailed,
    },
  };
}
