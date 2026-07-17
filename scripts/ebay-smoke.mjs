/**
 * Probe eBay Browse (DE) without writing to Postgres.
 *
 * Requires in .env.local:
 *   EBAY_CLIENT_ID
 *   EBAY_CLIENT_SECRET
 * Optional:
 *   EBAY_CATEGORY_ID (default 139973)
 *
 * Usage: node --env-file=.env.local scripts/ebay-smoke.mjs
 */
import { config } from "dotenv";

config({ path: ".env.local" });

const clientId = process.env.EBAY_CLIENT_ID?.trim();
const clientSecret = process.env.EBAY_CLIENT_SECRET?.trim();
const categoryId = process.env.EBAY_CATEGORY_ID?.trim() || "139973";

if (!clientId || !clientSecret) {
  console.error("Set EBAY_CLIENT_ID and EBAY_CLIENT_SECRET in .env.local");
  process.exit(1);
}

const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

const tokenRes = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization: `Basic ${basic}`,
  },
  body: new URLSearchParams({
    grant_type: "client_credentials",
    scope: "https://api.ebay.com/oauth/api_scope",
  }),
});

if (!tokenRes.ok) {
  console.error("OAuth failed", tokenRes.status, await tokenRes.text());
  process.exit(1);
}

const { access_token: token } = await tokenRes.json();
console.log("OAuth OK");

const filter = [
  "price:[0.5..10]",
  "priceCurrency:EUR",
  "buyingOptions:{FIXED_PRICE}",
  "deliveryCountry:DE",
].join(",");

const params = new URLSearchParams({
  category_ids: categoryId,
  limit: "20",
  offset: "0",
  filter,
  sort: "price",
});

const searchUrl = `https://api.ebay.com/buy/browse/v1/item_summary/search?${params}`;
const searchRes = await fetch(searchUrl, {
  headers: {
    Authorization: `Bearer ${token}`,
    "X-EBAY-C-MARKETPLACE-ID": "EBAY_DE",
  },
});

const body = await searchRes.json();
if (!searchRes.ok) {
  console.error("Search failed", searchRes.status, JSON.stringify(body, null, 2));
  process.exit(1);
}

const items = body.itemSummaries ?? [];
console.log(`Category ${categoryId}: total=${body.total ?? "?"} sample=${items.length}`);
for (const item of items.slice(0, 10)) {
  console.log(
    `- €${item.price?.value} · ${item.condition ?? "?"} · ${item.title?.slice(0, 80)}`,
  );
}
