// Example script to send a test email via the Gmail API helper.
// Usage:
// deno run --allow-net --allow-env scripts/send_example.ts

import { sendEmail } from "../src/concepts/NotificationConcept/send_email.ts";

function getEnv(name: string): string | null {
  return Deno.env.get(name) ?? null;
}

const required = [
  "GMAIL_CLIENT_ID",
  "GMAIL_CLIENT_SECRET",
  "GMAIL_REFRESH_TOKEN",
];
const missing = required.filter((k) => !getEnv(k));
if (missing.length) {
  console.error("Missing required environment variables:", missing.join(", "));
  console.error(
    "Please run scripts/get_gmail_refresh_token.ts to obtain a refresh token, and set CLIENT_ID/SECRET.",
  );
  Deno.exit(1);
}

async function main() {
  try {
    const result = await sendEmail({
      from: "Notification <notifications@example.com>",
      to: "camilaepierce@gmail.com",
      subject: "Test message from Final-Project",
      body: `This is a test message sent at ${new Date().toISOString()}`,
      html: false,
    });

    console.log("Send result:", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("Send failed:", err instanceof Error ? err.message : err);
    Deno.exit(2);
  }
}

main();
