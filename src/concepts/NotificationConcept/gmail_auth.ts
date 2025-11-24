// Deno module: Gmail OAuth helper
// Exports: getAccessToken()
// Reads env vars: GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN
// Caches access token until expiry.

const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

type TokenResponse = {
  access_token: string;
  expires_in: number; // seconds
  scope?: string;
  token_type?: string;
  id_token?: string;
};

let cachedToken: { token: string; expiresAt: number } | null = null;

function getEnv(name: string): string {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`Environment variable ${name} is required`);
  return v;
}

async function exchangeRefreshToken(refreshToken: string, clientId: string, clientSecret: string): Promise<TokenResponse> {
  const body = new URLSearchParams();
  body.set("client_id", clientId);
  body.set("client_secret", clientSecret);
  body.set("refresh_token", refreshToken);
  body.set("grant_type", "refresh_token");

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token endpoint returned ${res.status}: ${text}`);
  }

  const data = (await res.json()) as TokenResponse;
  if (!data.access_token || !data.expires_in) {
    throw new Error(`Invalid token response: ${JSON.stringify(data)}`);
  }
  return data;
}

/**
 * Returns a valid access token, refreshing using the refresh token if necessary.
 */
export async function getAccessToken(): Promise<string> {
  // If cached and not expired (with a 30s safety margin), return it
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt - 30_000 > now) {
    return cachedToken.token;
  }

  const clientId = getEnv("GMAIL_CLIENT_ID");
  const clientSecret = getEnv("GMAIL_CLIENT_SECRET");
  const refreshToken = getEnv("GMAIL_REFRESH_TOKEN");

  // Exchange refresh token
  const data = await exchangeRefreshToken(refreshToken, clientId, clientSecret);

  const expiresAt = Date.now() + data.expires_in * 1000;
  cachedToken = { token: data.access_token, expiresAt };
  return data.access_token;
}

export async function clearCachedToken(): Promise<void> {
  cachedToken = null;
}
