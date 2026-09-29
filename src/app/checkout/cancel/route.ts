/*
 * Stripe's back link. Releases the reserved stock straight away instead of
 * waiting for the session to expire. The order id in the URL must match this
 * browser's checkout cookie, so a link from elsewhere cannot cancel anything.
 */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { cancelCheckout, CHECKOUT_COOKIE, isOrderId } from "@/lib/checkout";

export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get("order");
  const cookieStore = await cookies();

  if (isOrderId(orderId) && cookieStore.get(CHECKOUT_COOKIE)?.value === orderId) {
    try {
      await cancelCheckout(orderId);
      cookieStore.delete(CHECKOUT_COOKIE);
    } catch (error) {
      // The session expires on its own and the webhook releases the stock.
      console.error(`Could not cancel checkout for order ${orderId}`, error);
    }
  }
  redirect("/bag?checkout=canceled");
}
