"use server";

/*
 * Starts Stripe Checkout for the bag. Prices, totals and stock come from the
 * database only: the bag cookie contributes product ids, sizes and quantities,
 * and the order (with its stock reserved) exists before Stripe is called.
 */
import { refresh } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getBagDetails } from "@/db/queries/cart";
import {
  createPendingOrder,
  InsufficientStockError,
  releaseOrder,
  setCheckoutSession,
} from "@/db/queries/orders";
import { readBag } from "@/lib/bag-cookie";
import {
  cancelCheckout,
  CHECKOUT_COOKIE,
  CHECKOUT_TTL_MS,
  isOrderId,
  revalidateProducts,
} from "@/lib/checkout";
import { getSession } from "@/lib/session";
import { getStripe } from "@/lib/stripe";

export type CheckoutError = "empty" | "bag-changed" | "sold-out" | "unavailable";

/* Tags these sessions in the Stripe Dashboard. */
const INTEGRATION_IDENTIFIER = "atelier-bag-checkout-qhzvmrta";

function siteUrl() {
  const url = process.env.BETTER_AUTH_URL;
  if (!url) throw new Error("BETTER_AUTH_URL is not set");
  return url.replace(/\/$/, "");
}

export async function startCheckout(): Promise<{ ok: false; reason: CheckoutError }> {
  const bag = await getBagDetails(await readBag());
  if (bag.lines.length === 0) return { ok: false, reason: "empty" };
  // Stock or availability changed since the bag was shown: let the shopper review it.
  if (bag.hasIssues) {
    refresh();
    return { ok: false, reason: "bag-changed" };
  }

  const cookieStore = await cookies();
  const previous = cookieStore.get(CHECKOUT_COOKIE)?.value;
  if (isOrderId(previous)) {
    // Release this browser's earlier unfinished checkout before reserving again.
    await cancelCheckout(previous).catch((error) =>
      console.error(`Could not cancel previous checkout ${previous}`, error),
    );
  }

  const session = await getSession();
  const expiresAt = new Date(Date.now() + CHECKOUT_TTL_MS);
  const items = bag.lines.flatMap((line) =>
    line.product
      ? [
          {
            productId: line.productId,
            size: line.size,
            quantity: line.quantity,
            unitPriceCents: line.product.unitPriceCents,
            productName: line.product.name,
            productSlug: line.product.slug,
            image: line.product.image,
          },
        ]
      : [],
  );

  let order: Awaited<ReturnType<typeof createPendingOrder>>;
  try {
    order = await createPendingOrder({
      userId: session?.user.id ?? null,
      email: session?.user.email ?? null,
      items,
      expiresAt,
    });
  } catch (error) {
    if (!(error instanceof InsufficientStockError)) throw error;
    refresh();
    return { ok: false, reason: "sold-out" };
  }
  revalidateProducts(items.map((item) => item.productSlug));

  const base = siteUrl();
  let checkoutUrl: string;
  try {
    const checkout = await getStripe().checkout.sessions.create(
      {
        mode: "payment",
        line_items: items.map((item) => ({
          quantity: item.quantity,
          price_data: {
            currency: "usd",
            unit_amount: item.unitPriceCents,
            product_data: {
              name: item.size === "One size" ? item.productName : `${item.productName} (${item.size})`,
              images: [item.image.src],
              metadata: { product_id: item.productId, size: item.size },
            },
          },
        })),
        client_reference_id: order.id,
        metadata: { order_id: order.id },
        payment_intent_data: { metadata: { order_id: order.id } },
        ...(session?.user.email ? { customer_email: session.user.email } : {}),
        expires_at: Math.floor(expiresAt.getTime() / 1000),
        success_url: `${base}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${base}/checkout/cancel?order=${order.id}`,
        integration_identifier: INTEGRATION_IDENTIFIER,
      },
      { idempotencyKey: `checkout:${order.id}` },
    );
    if (!checkout.url) throw new Error("Checkout Session has no URL");
    await setCheckoutSession(order.id, checkout.id);
    checkoutUrl = checkout.url;
  } catch (error) {
    console.error(`Could not create a Checkout Session for order ${order.id}`, error);
    revalidateProducts(await releaseOrder(order.id, "canceled", ["pending"]));
    return { ok: false, reason: "unavailable" };
  }

  cookieStore.set(CHECKOUT_COOKIE, order.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60,
  });
  redirect(checkoutUrl);
}
