import {
  getEbayClientId,
  getEbayClientSecret,
} from "./config";

interface CachedToken {
  accessToken: string;
  expiresAtMs: number;
}

let cached: CachedToken | null = null;

/**
 * Application token (client credentials) — public Browse search only.
 * Cached in process memory until near expiry.
 */
export async function getEbayAccessToken(): Promise<string> {
  const now = Date.now();
  if (cached && cached.expiresAtMs > now + 60_000) {
    return cached.accessToken;
  }

  const clientId = getEbayClientId();
  const clientSecret = getEbayClientSecret();
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(
    "https://api.ebay.com/identity/v1/oauth2/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basic}`,
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        scope: "https://api.ebay.com/oauth/api_scope",
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`eBay OAuth failed (${response.status}): ${body}`);
  }

  const json = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
  };

  if (!json.access_token) {
    throw new Error("eBay OAuth response missing access_token");
  }

  const expiresInSec = json.expires_in ?? 7200;
  cached = {
    accessToken: json.access_token,
    expiresAtMs: now + expiresInSec * 1000,
  };

  return cached.accessToken;
}
