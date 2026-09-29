/*
 * Stripe webhook endpoint. The signature is checked against the raw body, and
 * each event only triggers syncCheckoutSession, which re-reads the session
 * from Stripe and applies idempotent transitions. Duplicate and out-of-order
 * deliveries are therefore harmless; stripe_events skips finished ones early.
 */
import type Stripe from "stripe";
import { markStripeEventProcessed, recordStripeEvent } from "@/db/queries/orders";
import { syncCheckoutSession } from "@/lib/checkout";
import { getStripe, getWebhookSecret } from "@/lib/stripe";

const CHECKOUT_EVENTS = new Set<Stripe.Event.Type>([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "checkout.session.expired",
]);

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  // Missing configuration throws here (500), not as a signature failure.
  const stripe = getStripe();
  const secret = getWebhookSecret();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (!CHECKOUT_EVENTS.has(event.type)) return Response.json({ received: true });
  if (!(await recordStripeEvent(event))) return Response.json({ received: true, duplicate: true });

  // A throw here returns 500, so Stripe retries; handlers are safe to repeat.
  const session = event.data.object as Stripe.Checkout.Session;
  await syncCheckoutSession(session.id);
  await markStripeEventProcessed(event.id);
  return Response.json({ received: true });
}
