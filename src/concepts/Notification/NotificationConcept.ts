import {
  Message as EmailMessage,
  sendEmail as sendViaGmail,
} from "./send_email.ts";

export type MessageTemplate = string;
export type Message = EmailMessage;

function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function isAllowedDomain(email: string): boolean {
  const domainsEnv = Deno.env.get("NOTIFICATION_ALLOWED_DOMAINS");
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  if (domainsEnv) {
    const allowed = domainsEnv.split(",").map((d) => d.trim().toLowerCase())
      .filter(Boolean);
    return allowed.length === 0 ? true : allowed.includes(domain);
  }
  // Default policy: allow @mit.edu addresses
  return domain.endsWith("mit.edu") || domain.endsWith("gmail.com");
}

/**
 * Create a Message object from a template, recipient email, and name.
 * Supported placeholders: {{name}}, {{email}}
 */
export function createMessageBody(
  template: MessageTemplate,
  email: string,
  name: string,
): Message {
  if (!template) throw new Error("template is required");
  if (!email) throw new Error("recipient email is required");
  if (!name) throw new Error("recipient name is required");
  if (!isValidEmail(email)) throw new Error(`invalid email address: ${email}`);
  // if (!isAllowedDomain(email)) {
  //   throw new Error(`recipient domain not allowed: ${email}`);
  // }

  const body = template
    .replace(/\{\{\s*name\s*\}\}/gi, name)
    .replace(/\{\{\s*email\s*\}\}/gi, email);

  const subject = `Notification for ${name}`;
  const from = Deno.env.get("GMAIL_SENDER") ?? "dam.good.housing@gmail.com";

  return {
    from,
    to: email,
    subject,
    body,
    html: false,
  };
}

/**
 * Send a Message. This delegates to the lower-level send helper which
 * supports dry-run via `NOTIFICATIONS_DRY_RUN` env var.
 */
export async function sendEmail(message: Message): Promise<unknown> {
  if (!message) throw new Error("message is required");
  if (!message.to) throw new Error("message.to is required");
  if (!isValidEmail(message.to)) {
    throw new Error(`invalid recipient email: ${message.to}`);
  }

  // Delegate to the send helper (it will respect dry-run behavior)
  return await sendViaGmail(message);
}
