/*
 * Order state driven by Stripe. Payment status is never taken from the client
 * or from a URL: every path (webhook, success redirect, cancel link, admin
 * reconcile) retrieves the Checkout Session from the Stripe API and applies
 * the same idempotent, conditional transitions (src/db/queries/orders.ts).
 */
import "server-only";
import { revalidatePath } from "next/cache";
import type Stripe from "stripe";
import {
  flagForReview,
  getOrder,
  getStaleOrders,
  markPaid,
  markPaidAfterRelease,
  markProcessing,
  releaseOrder,
  setCheckoutSession,
} from "@/db/queries/orders";
import type { OrderStatus } from "@/db/schema";
import { getStripe } from "@/lib/stripe";

/* httpOnly cookie holding the id of this browser's latest pending order. */
export const CHECKOUT_COOKIE = "atelier_checkout";

/* Checkout Sessions must live at least 30 minutes; the buffer covers clock skew. */
export const CHECKOUT_TTL_MS = 31 * 60 * 1000;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isOrderId = (value: unknown): value is string =>
  typeof value === "string" && UUID.test(value);

export const isCheckoutSessionId = (value: unknown): value is string =>
  typeof value === "string" && /^cs_[A-Za-z0-9_]{1,250}$/.test(value);

/* Product pages are ISR; refresh the ones whose stock just changed. */
export function revalidateProducts(slugs: string[]) {
  for (const slug of new Set(slugs)) revalidatePath(`/products/${slug}`);
}

const paymentIntentOf = (session: Stripe.Checkout.Session) =>
  typeof session.payment_intent === "string" ? null : session.payment_intent;

/*
 * Brings our order in line with its Checkout Session as Stripe reports it.
 * Safe to call any number of times, concurrently, from any entry point.
 * Returns the order's status afterwards, or null if the session is not ours.
 */
export async function syncCheckoutSession(sessionId: string): Promise<OrderStatus | null> {
  const session = await getStripe().checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent"],
  });
  const orderId = session.metadata?.order_id ?? session.client_reference_id;
  if (!isOrderId(orderId)) return null;

  const order = await getOrder(orderId);
  if (!order) return null;
  if (order.stripeCheckoutSessionId && order.stripeCheckoutSessionId !== session.id) {
    console.error(`Order ${order.id} is linked to a different Checkout Session than ${session.id}`);
    return order.status;
  }
  // The server may have stopped between creating the session and saving its id.
  if (!order.stripeCheckoutSessionId) await setCheckoutSession(order.id, session.id);

  const email = session.customer_details?.email ?? null;
  const paymentIntent = paymentIntentOf(session);

  if (session.status === "expired") {
    revalidateProducts(await releaseOrder(order.id, "expired", ["pending"]));
  } else if (session.status === "complete") {
    if (session.payment_status === "unpaid") {
      // A delayed payment method (bank debit): succeeded later or failed.
      const failed =
        paymentIntent?.status === "requires_payment_method" || paymentIntent?.status === "canceled";
      if (failed) {
        revalidateProducts(await releaseOrder(order.id, "payment_failed", ["pending", "processing"]));
      } else {
        await markProcessing(order.id, email);
      }
    } else if (session.amount_total !== order.totalCents || session.currency !== order.currency) {
      // Paid, but not the amount we asked for. Never fulfil automatically.
      console.error(
        `Order ${order.id}: Stripe charged ${session.amount_total} ${session.currency}, expected ${order.totalCents} ${order.currency}`,
      );
      await flagForReview(order.id);
    } else {
      const payment = { paymentIntentId: paymentIntent?.id ?? null, email };
      if (!(await markPaid(order.id, payment))) {
        // Already paid (a duplicate), or paid after its stock was released.
        const result = await markPaidAfterRelease(order.id, payment);
        if (result.needsReview) {
          console.error(`Order ${order.id} was paid after its stock was released and resold`);
        }
      }
    }
  }

  return (await getOrder(order.id))?.status ?? null;
}

/*
 * Ends a pending checkout from our side (back link, or a newer checkout from
 * the same browser) and releases its stock. If Stripe reports the session
 * already completed, the order is synced instead, so a payment is never lost.
 */
export async function cancelCheckout(orderId: string) {
  const order = await getOrder(orderId);
  if (!order || order.status !== "pending") return;

  if (!order.stripeCheckoutSessionId) {
    revalidateProducts(await releaseOrder(order.id, "canceled", ["pending"]));
    return;
  }

  const stripe = getStripe();
  try {
    await stripe.checkout.sessions.expire(order.stripeCheckoutSessionId);
  } catch {
    // Already expired or completed; the retrieve below says which.
  }
  const session = await stripe.checkout.sessions.retrieve(order.stripeCheckoutSessionId);
  if (session.status === "expired") {
    revalidateProducts(await releaseOrder(order.id, "canceled", ["pending"]));
  } else {
    await syncCheckoutSession(session.id);
  }
}

/*
 * Safety net for missed webhooks: settles orders still pending or processing
 * well after their Checkout Session should have ended.
 */
export async function reconcileStaleOrders(graceMs = 5 * 60 * 1000) {
  const stale = await getStaleOrders(new Date(Date.now() - graceMs));
  const results: { id: string; before: OrderStatus; after: OrderStatus | null }[] = [];
  for (const order of stale) {
    let after: OrderStatus | null;
    if (order.sessionId) {
      after = await syncCheckoutSession(order.sessionId);
    } else {
      revalidateProducts(await releaseOrder(order.id, "canceled", ["pending"]));
      after = (await getOrder(order.id))?.status ?? null;
    }
    results.push({ id: order.id, before: order.status, after });
  }
  return results;
}
