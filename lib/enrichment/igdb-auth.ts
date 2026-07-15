interface TwitchTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

export async function getIgdbAccessToken(): Promise<string | null> {
  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
  });

  if (!response.ok) {
    throw new Error(`Twitch OAuth failed: ${response.status}`);
  }

  const json = (await response.json()) as TwitchTokenResponse;
  cachedToken = json.access_token;
  tokenExpiresAt = now + json.expires_in * 1000 - 60_000;
  return cachedToken;
}

export function getIgdbClientId(): string | null {
  return process.env.IGDB_CLIENT_ID ?? null;
}
