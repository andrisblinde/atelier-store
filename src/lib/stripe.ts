/*
 * Server-only Stripe client. Created on first use rather than at import, so
 * `next build` and pages that never pay do not need Stripe keys.
 * STRIPE_SECRET_KEY should be a restricted key (rk_...) with write access to
 * Checkout Sessions and read access to Payment Intents.
 */
import "server-only";
import Stripe from "stripe";

let client: Stripe | undefined;

export function getStripe() {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    // Pinned so an SDK upgrade never changes API behaviour silently.
    client = new Stripe(key, { apiVersion: "2026-08-26.dahlia" });
  }
  return client;
}

export function getWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  return secret;
}
