import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
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
          <ul className="divide-y border-y">
            {order.items.map((item) => (
              <li
                key={`${item.productSlug}:${item.size}`}
                className="grid grid-cols-[5.5rem_1fr_auto] items-start gap-4 py-6 sm:grid-cols-[7rem_1fr_auto] sm:gap-6"
              >
                <div className="media-frame">
                  <Image src={item.image.src} alt={item.image.alt} fill sizes="7rem" />
                </div>
                <div className="space-y-1">
                  <h2 className="type-small">
                    <Link href={`/products/${item.productSlug}`} className="link-quiet">
                      {item.productName}
                    </Link>
                  </h2>
                  {item.size !== "One size" && (
                    <p className="type-small text-ink-muted">Size: {item.size}</p>
                  )}
                  <p className="type-small text-ink-muted">Quantity: {item.quantity}</p>
                </div>
                <p className="type-price">
                  {formatPrice((item.unitPriceCents * item.quantity) / 100)}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <aside aria-labelledby="order-summary" className="bg-surface p-6">
          <h2 id="order-summary" className="type-h3">
            Order summary
          </h2>
          <dl className="mt-6 space-y-3">
            <div className="flex justify-between gap-4">
              <dt className="type-small text-ink-muted">Order</dt>
              <dd className="type-small tabular-nums">{order.id.slice(0, 8).toUpperCase()}</dd>
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
