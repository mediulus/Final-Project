// Deno module: send_email.ts
// Lightweight Gmail send helper that uses the oauth helper `getAccessToken()`.
// Usage: import { sendEmail } from './send_email.ts';

import { getAccessToken } from "./gmail_auth.ts";

export type Message = {
  from?: string; // optional 'From' header (e.g. "Notifications <notifications@example.com>")
  to: string; // recipient email address
  subject: string;
  body: string; // plain-text body by default
  html?: boolean; // if true, send as text/html
};

function buildRfc2822(msg: Message): string {
  const from = msg.from ?? "";
  const lines = [] as string[];
  if (from) lines.push(`From: ${from}`);
  lines.push(`To: ${msg.to}`);
  lines.push(`Subject: ${msg.subject}`);
  lines.push("MIME-Version: 1.0");
  if (msg.html) {
    lines.push('Content-Type: text/html; charset="UTF-8"');
  } else {
    lines.push('Content-Type: text/plain; charset="UTF-8"');
  }
  lines.push("");
  lines.push(msg.body);
  return lines.join("\r\n");
}

function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const b64 = btoa(binary);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Sends an email via Gmail API using the `users/me/messages/send` endpoint.
 * Returns the parsed JSON response from Gmail on success.
 */
export async function sendEmail(message: Message): Promise<any> {
  const dryRun =
    (Deno.env.get("NOTIFICATIONS_DRY_RUN") ?? "true").toLowerCase() === "true";

  const raw = buildRfc2822(message);

  if (dryRun) {
    // Temporary behavior: print the composed message to console for testing/development
    console.log("--- Notification (dry-run) ---");
    console.log(raw);
    console.log("--- End Notification ---");
    return { dryRun: true, printed: true };
  }

  // Real send path (Gmail API)
  const accessToken = await getAccessToken();
  const encoded = base64UrlEncode(raw);

  const res = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw: encoded }),
    },
  );

  const text = await res.text();
  if (!res.ok) {
    // Try to provide helpful error message
    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
    throw new Error(
      `Gmail send failed (${res.status}): ${JSON.stringify(payload)}`,
    );
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// Example (commented):
// import { sendEmail } from './send_email.ts';
// await sendEmail({ from: 'Notify <notifications@example.com>', to: 'you@example.com', subject: 'Test', body: 'Hello', html: false });
