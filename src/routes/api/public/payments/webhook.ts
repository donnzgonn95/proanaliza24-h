import { createFileRoute } from "@tanstack/react-router";
import { type StripeEnv, createStripeClient } from "@/lib/stripe.server";

function getWebhookSecret(env: StripeEnv): string {
  const key = env === "sandbox" ? "PAYMENTS_SANDBOX_WEBHOOK_SECRET" : "PAYMENTS_LIVE_WEBHOOK_SECRET";
  const v = process.env[key];
  if (!v) throw new Error(`${key} is not configured`);
  return v;
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const envParam = url.searchParams.get("env");
        const env: StripeEnv = envParam === "live" ? "live" : "sandbox";

        const signature = request.headers.get("stripe-signature");
        if (!signature) return new Response("Missing signature", { status: 400 });

        const body = await request.text();
        const stripe = createStripeClient(env);

        let event;
        try {
          event = await stripe.webhooks.constructEventAsync(
            body,
            signature,
            getWebhookSecret(env),
          );
        } catch (err) {
          console.error("[webhook] signature verification failed", err);
          return new Response("Invalid signature", { status: 400 });
        }

        // Minimal acknowledgment handler. Subscription gating + DB persistence
        // will be wired up once authentication is in place.
        switch (event.type) {
          case "checkout.session.completed":
          case "customer.subscription.created":
          case "customer.subscription.updated":
          case "customer.subscription.deleted":
          case "invoice.payment_failed":
            console.log(`[webhook:${env}] ${event.type}`, event.id);
            break;
          default:
            console.log(`[webhook:${env}] unhandled ${event.type}`);
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});
