import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderItems } from "@/components/order/order-items";
import { OrderStatusLabel, orderReference } from "@/components/order/order-status";
import { ListingHeader } from "@/components/product-listing";
import { getCustomerOrder } from "@/db/queries/orders";
import { isOrderId } from "@/lib/checkout";
import { formatPrice } from "@/lib/product";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Order details",
  robots: { index: false, follow: false },
};

const dateTime = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function OrderPage({ params }: PageProps<"/account/orders/[id]">) {
  const { id } = await params;
  const { user } = await requireUser(`/account/orders/${encodeURIComponent(id)}`);
  // Someone else's order and a missing one look the same: a 404.
  if (!isOrderId(id)) notFound();
  const order = await getCustomerOrder(user.id, id);
  if (!order) notFound();

  const details = [
    { label: "Placed", value: dateTime.format(order.createdAt) },
    ...(order.paidAt ? [{ label: "Paid", value: dateTime.format(order.paidAt) }] : []),
    ...(order.email ? [{ label: "Receipt sent to", value: order.email }] : []),
  ];

  return (
    <main id="main">
      <ListingHeader
        eyebrow="Your account"
        title={`Order ${orderReference(order.id)}`}
        intro={intro[order.status as keyof typeof intro] ?? ""}
        parent={{ href: "/account", label: "Account" }}
      />
      <div className="container-page grid items-start gap-10 pb-section lg:grid-cols-[1fr_22rem] lg:gap-16">
        <section aria-label="Order items">
          <OrderItems items={order.items} />
        </section>

        <aside aria-labelledby="order-summary" className="bg-surface p-6">
          <h2 id="order-summary" className="type-h3">
            Summary
          </h2>
          <dl className="mt-6 space-y-3">
            <div className="flex justify-between gap-4">
              <dt className="type-small text-ink-muted">Status</dt>
              <dd>
                <OrderStatusLabel status={order.status} />
              </dd>
            </div>
            {details.map((detail) => (
              <div key={detail.label} className="flex justify-between gap-4">
                <dt className="type-small shrink-0 text-ink-muted">{detail.label}</dt>
                <dd className="type-small min-w-0 break-words text-right">{detail.value}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-4 border-t pt-3">
              <dt className="type-small text-ink-muted">Subtotal</dt>
              <dd className="type-price">{formatPrice(order.subtotalCents / 100)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="type-small text-ink-muted">Shipping</dt>
              <dd className="type-small text-ink-muted">Complimentary</dd>
            </div>
            <div className="flex justify-between gap-4 border-t pt-3">
              <dt className="type-small">Total</dt>
              <dd className="type-price">{formatPrice(order.totalCents / 100)}</dd>
            </div>
          </dl>
          <Link href="/account" className="btn btn-secondary mt-6 w-full">
            Back to your account
          </Link>
        </aside>
      </div>
    </main>
  );
}

const intro = {
  paid: "Thank you for your order. Your payment was received.",
  processing: "Your payment is being processed. Your pieces are held until it completes.",
  payment_failed: "Your payment didn't go through, so you weren't charged.",
};
