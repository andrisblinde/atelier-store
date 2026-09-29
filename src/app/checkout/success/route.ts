/*
 * Stripe redirects here after payment. The session id only identifies the
 * order: its status is retrieved from Stripe, never inferred from this visit.
 * Webhooks settle the order too; this just avoids waiting for them.
 */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { writeBag } from "@/lib/bag-cookie";
import { CHECKOUT_COOKIE, isCheckoutSessionId, syncCheckoutSession } from "@/lib/checkout";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  if (!isCheckoutSessionId(sessionId)) redirect("/bag");

  let status = null;
  try {
    status = await syncCheckoutSession(sessionId);
  } catch (error) {
    // The confirmation page still renders; the webhook will settle the order.
    console.error(`Could not sync Checkout Session ${sessionId}`, error);
  }

  if (status === "paid" || status === "processing") {
    await writeBag([]);
    (await cookies()).delete(CHECKOUT_COOKIE);
  }
  redirect(`/checkout/confirmation?session_id=${encodeURIComponent(sessionId)}`);
}
