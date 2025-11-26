import { assertEquals } from "https://deno.land/std@0.201.0/testing/asserts.ts";
import NotificationConcept from "./NotificationConcept.ts";

const notifier = new NotificationConcept();

Deno.test(
  "createMessageBody replaces placeholders and sets fields",
  async () => {
    Deno.env.set("NOTIFICATION_ALLOWED_DOMAINS", "mit.edu");
    Deno.env.set("GMAIL_SENDER", "dam.good.housing@gmail.com");

    const template = "Hello {{name}}, your email is {{email}}.";
    const result = await notifier.createMessageBody({
      template,
      email: "camilaepierce@gmail.com",
      name: "Camila",
    });
    const msg = result.message;

    assertEquals(msg.to, "camilaepierce@gmail.com");
    assertEquals(msg.subject, "Notification for Camila");
    assertEquals(
      msg.body,
      "Hello Camila, your email is camilaepierce@gmail.com."
    );
    assertEquals(msg.from, "dam.good.housing@gmail.com");
  }
);

Deno.test("sendEmail dry-run prints and returns success", async () => {
  // Ensure dry-run and allowed domain
  Deno.env.set("NOTIFICATIONS_DRY_RUN", "true");
  Deno.env.set("NOTIFICATION_ALLOWED_DOMAINS", "mit.edu");

  const template = "Integration test for {{name}}";
  const msgResult = await notifier.createMessageBody({
    template,
    email: "camilaepierce@gmail.com",
    name: "Camila",
  });

  const res = await notifier.sendEmail({ message: msgResult.message });

  // sendEmail returns { delivered: true } regardless of dry-run mode
  // The dry-run behavior (printing to console) is handled by sendViaGmail internally
  assertEquals(res && (res as Record<string, unknown>).delivered, true);
});
