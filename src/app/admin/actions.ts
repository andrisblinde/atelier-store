"use server";

import { reconcileStaleOrders } from "@/lib/checkout";
import { requireAdmin } from "@/lib/session";

/*
 * Settles orders still pending or processing after their Checkout Session
 * should have ended, by asking Stripe. Only needed if webhooks were missed.
 */
export async function reconcileOrders() {
  await requireAdmin();
  const results = await reconcileStaleOrders();
  return {
    checked: results.length,
    changed: results.filter((result) => result.after !== result.before).length,
  };
}
