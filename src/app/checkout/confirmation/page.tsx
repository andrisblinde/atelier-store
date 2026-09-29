import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderItems } from "@/components/order/order-items";
import { orderReference } from "@/components/order/order-status";
import { ListingHeader } from "@/components/product-listing";
import { getOrderBySession } from "@/db/queries/orders";
import type { OrderStatus } from "@/db/schema";
import { isCheckoutSessionId } from "@/lib/checkout";
import { formatPrice } from "@/lib/product";

export const metadata: Metadata = {
  title: "Order confirmation",
  robots: { index: false, follow: false },
};

const copy: Record<OrderStatus, { title: string; intro: string }> = {
  paid: {
    title: "Thank you for your order",
    intro: "Your payment was received. Stripe has emailed your receipt.",
  },
  processing: {
    title: "Payment processing",
    intro: "Your payment is being processed. Your pieces are held for you until it completes.",
  },
  pending: {
    title: "Confirming your payment",
    intro: "We haven't received confirmation from Stripe yet. Refresh this page in a moment.",
  },
  payment_failed: {
    title: "Payment failed",
    intro: "Your payment didn't go through and you haven't been charged. Your bag is still saved.",
  },
  expired: {
    title: "Checkout expired",
    intro: "This checkout expired before payment was completed. You haven't been charged.",
  },
  canceled: {
    title: "Checkout canceled",
    intro: "This checkout was canceled. You haven't been charged.",
  },
};

/* Shows an order found by its Checkout Session id (unguessable, from Stripe's redirect). */
export default async function ConfirmationPage({
  searchParams,
}: PageProps<"/checkout/confirmation">) {
  const sessionId = (await searchParams).session_id;
  if (!isCheckoutSessionId(sessionId)) notFound();
  const order = await getOrderBySession(sessionId);
  if (!order) notFound();

  const { title, intro } = copy[order.status];
  const settled = order.status === "paid" || order.status === "processing";

  return (
    <main id="main">
      <ListingHeader eyebrow="Checkout" title={title} intro={intro} />
      <div className="container-page grid items-start gap-10 pb-section lg:grid-cols-[1fr_22rem] lg:gap-16">
        <section aria-label="Order items">
          <OrderItems items={order.items} />
        </section>

        <aside aria-labelledby="order-summary" className="bg-surface p-6">
          <h2 id="order-summary" className="type-h3">
            Order summary
          </h2>
          <dl className="mt-6 space-y-3">
            <div className="flex justify-between gap-4">
              <dt className="type-small text-ink-muted">Order</dt>
              <dd className="type-small tabular-nums">{orderReference(order.id)}</dd>
            </div>
            {order.email && (
              <div className="flex justify-between gap-4">
                <dt className="type-small text-ink-muted">Email</dt>
                <dd className="type-small">{maskEmail(order.email)}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4 border-t pt-3">
              <dt className="type-small">Total</dt>
              <dd className="type-price">{formatPrice(order.totalCents / 100)}</dd>
            </div>
          </dl>
          <Link
            href={settled ? "/shop" : "/bag"}
            className="btn btn-secondary mt-6 w-full"
          >
            {settled ? "Continue shopping" : "Return to your bag"}
          </Link>
        </aside>
      </div>
    </main>
  );
}

/* "jane.doe@example.com" → "j•••@example.com": the URL alone should not reveal it. */
function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  return domain ? `${name?.[0] ?? ""}•••@${domain}` : "•••";
}
