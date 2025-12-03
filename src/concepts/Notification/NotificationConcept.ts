import {
  Message as EmailMessage,
  sendEmail as sendViaGmail,
} from "./send_email.ts";

export type MessageTemplate = string;
export type Message = EmailMessage;

export default class NotificationConcept {
  private isValidEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  private isAllowedDomain(email: string): boolean {
    const domainsEnv = Deno.env.get("NOTIFICATION_ALLOWED_DOMAINS");
    const domain = email.split("@")[1]?.toLowerCase() ?? "";
    if (domainsEnv) {
      const allowed = domainsEnv.split(",").map((d) => d.trim().toLowerCase())
        .filter(Boolean);
      return allowed.length === 0 ? true : allowed.includes(domain);
    }
    // Default policy: allow @mit.edu addresses and gmail for testing
    return domain.endsWith("mit.edu") || domain.endsWith("gmail.com");
  }

  /**
   * ✅ Concept Action: createMessageBody (template, email, name)
   *
   * **effects** creates a formatted message with placeholders replaced
   */
  async createMessageBody({
    template,
    email,          // recipient email
    name,
    subjectOverride,
    contactEmail,   // NEW: optional email of the person reaching out
  }: {
    template: MessageTemplate;
    email: string;       // recipient
    name: string;
    subjectOverride?: string;
    contactEmail?: string; // NEW
  }): Promise<{ message: Message }> {
    if (!template) throw new Error("template is required");
    if (!email) throw new Error("recipient email is required");
    if (!name) throw new Error("recipient name is required");

    if (!this.isValidEmail(email)) {
      throw new Error(`invalid email address: ${email}`);
    }
    if (contactEmail && !this.isValidEmail(contactEmail)) {
      throw new Error(`invalid contactEmail: ${contactEmail}`);
    }

    let body = template
      .replace(/\{\{\s*name\s*\}\}/gi, name)
      .replace(/\{\{\s*email\s*\}\}/gi, email);

    // NEW: optional replacement
    if (contactEmail) {
      body = body.replace(/\{\{\s*contactEmail\s*\}\}/gi, contactEmail);
    }

    const subject = subjectOverride ?? `Notification for ${name}`;
    const from = Deno.env.get("GMAIL_SENDER") ?? "dam.good.housing@gmail.com";

    return {
      message: {
        from,
        to: email,
        subject,
        body,
        html: false,
      },
    };
  }
  // async createMessageBody({
  //   template,
  //   email,
  //   name,
  //   subjectOverride,
  // }: {
  //   template: MessageTemplate;
  //   email: string;
  //   name: string;
  //   subjectOverride?: string;
  // }): Promise<{ message: Message }> {
  //   if (!template) throw new Error("template is required");
  //   if (!email) throw new Error("recipient email is required");
  //   if (!name) throw new Error("recipient name is required");
  //   if (!this.isValidEmail(email)) {
  //     throw new Error(`invalid email address: ${email}`);
  //   }

  //   const body = template
  //     .replace(/\{\{\s*name\s*\}\}/gi, name)
  //     .replace(/\{\{\s*email\s*\}\}/gi, email);

  //   const subject = subjectOverride ?? `Notification for ${name}`;
  //   const from = Deno.env.get("GMAIL_SENDER") ?? "dam.good.housing@gmail.com";

  //   return {
  //     message: {
  //       from,
  //       to: email,
  //       subject,
  //       body,
  //       html: false,
  //     },
  //   };
  // }

  /**
   * ✅ Concept Action: sendEmail (message)
   *
   * **effects** sends the provided email
   */
  async sendEmail({
    message,
  }: {
    message: Message;
  }): Promise<{ delivered: boolean }> {
    if (!message) throw new Error("message is required");
    if (!message.to) throw new Error("message.to is required");
    if (!this.isValidEmail(message.to)) {
      throw new Error(`invalid recipient email: ${message.to}`);
    }

    await sendViaGmail(message);
    return {delivered: true };
  }
}
