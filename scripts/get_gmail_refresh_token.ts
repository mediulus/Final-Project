// Deno script to obtain an OAuth2 refresh token for Gmail API.
// Usage:
// 1. Set env: GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET (or provide client JSON path and uncomment the loader).
// 2. Run: deno run --allow-net --allow-env --allow-read --allow-run scripts/get_gmail_refresh_token.ts
// The script starts a local server and prints the consent URL. After consenting, it will print the refresh_token.

// Using the built-in Deno.serve API instead of importing `serve` from std

const SCOPES = ["https://www.googleapis.com/auth/gmail.send"].join(" ");
const PORT = 8080;
const REDIRECT_PATH = "/oauth2callback";
const REDIRECT_URI = `http://localhost:${PORT}${REDIRECT_PATH}`;

function getEnv(name: string): string | null {
  return Deno.env.get(name) ?? null;
}

const clientId = getEnv("GMAIL_CLIENT_ID");
const clientSecret = getEnv("GMAIL_CLIENT_SECRET");

if (!clientId || !clientSecret) {
  console.error(
    "Please set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET as environment variables.",
  );
  Deno.exit(1);
}

function buildConsentUrl(clientId: string, redirectUri: string, scope: string) {
  const u = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  u.searchParams.set("client_id", clientId);
  u.searchParams.set("redirect_uri", redirectUri);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("scope", scope);
  u.searchParams.set("access_type", "offline");
  u.searchParams.set("prompt", "consent");
  return u.toString();
}

const consentUrl = buildConsentUrl(clientId, REDIRECT_URI, SCOPES);

console.log("Open this URL in your browser and grant access:");
console.log(consentUrl);
console.log("");
console.log(
  `The embedded local redirect URI is ${REDIRECT_URI}. Waiting for the authorization response...`,
);

// Start a minimal server to capture the authorization code using the stable Deno.serve API
const controller = new AbortController();
const { signal } = controller;

(async () => {
  try {
    await Deno.serve({ port: PORT, signal }, async (req: Request) => {
      try {
        const url = new URL(req.url);
        if (url.pathname !== REDIRECT_PATH) {
          return new Response("Not found", { status: 404 });
        }

        const code = url.searchParams.get("code");
        const error = url.searchParams.get("error");

        if (error) {
          const body = `Error: ${error}`;
          console.error(body);
          controller.abort();
          return new Response(body, { status: 400 });
        }

        if (!code) {
          return new Response("Missing code", { status: 400 });
        }

        // Respond early so the browser can close, then continue exchanging the code.
        const response = new Response(
          "Authorization received. You can close this tab.",
          { status: 200 },
        );

        console.log("Exchanging authorization code for tokens...");
        const token = await exchangeCodeForToken(
          code,
          clientId,
          clientSecret,
          REDIRECT_URI,
        );

        if (!token.refresh_token) {
          console.warn(
            "No refresh_token returned. Make sure you used 'access_type=offline' and 'prompt=consent' when opening the consent URL.",
          );
        }

        console.log("---");
        console.log("Save these values securely (do NOT commit them):");
        console.log(`REFRESH_TOKEN=${token.refresh_token ?? "(not provided)"}`);
        console.log(`ACCESS_TOKEN (short-lived): ${token.access_token}`);
        console.log("---");
        console.log("Store the refresh token in your environment (example):");
        console.log("export GMAIL_REFRESH_TOKEN='the-refresh-token'");

        controller.abort();
        return response;
      } catch (err: unknown) {
        if (err instanceof Error) console.error("Handler error:", err);
        else console.error("Handler error (unknown):", err);
        controller.abort();
        return new Response("Internal server error", { status: 500 });
      }
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      // expected on graceful shutdown
    } else {
      console.error(err);
    }
  }
})();

async function exchangeCodeForToken(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
) {
  const params = new URLSearchParams();
  params.set("code", code);
  params.set("client_id", clientId);
  params.set("client_secret", clientSecret);
  params.set("redirect_uri", redirectUri);
  params.set("grant_type", "authorization_code");

  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const text = await resp.text();
  if (!resp.ok) {
    throw new Error(`Token exchange failed: ${resp.status} ${text}`);
  }

  const data = JSON.parse(text);
  return data;
}
