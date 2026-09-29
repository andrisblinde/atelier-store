import type { Metadata } from "next";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { OrderStatusLabel, orderReference } from "@/components/order/order-status";
import { ListingHeader } from "@/components/product-listing";
import { getCustomerOrders } from "@/db/queries/orders";
import { formatPrice } from "@/lib/product";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};

const memberSince = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });
const orderDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default async function AccountPage() {
  const { user } = await requireUser("/account");
  // Scoped to the session's user id; never taken from the request.
  const orders = await getCustomerOrders(user.id);

  return (
    <main id="main">
      <ListingHeader
        eyebrow="Your account"
        title={`Hello, ${user.name.trim().split(/\s+/)[0] || "there"}`}
        intro="Your details and orders at Atelier."
      />
      <div className="container-page pb-section">
        <dl className="max-w-md divide-y border-y">
          <Detail label="Name" value={user.name} />
          <Detail label="Email" value={user.email} />
          <Detail label="Member since" value={memberSince.format(user.createdAt)} />
        </dl>

        <div className="mt-8 flex flex-wrap gap-3">
          <SignOutButton />
          {user.role === "admin" && (
            <Link href="/admin" className="btn btn-secondary">
              Admin
            </Link>
          )}
        </div>

        <section aria-labelledby="orders-title" className="mt-16">
          <h2 id="orders-title" className="type-h3 mb-6">
            Orders
          </h2>
          {orders.length === 0 ? (
            <div className="border-y py-8">
              <p className="type-body text-ink-muted">You haven&apos;t placed any orders yet.</p>
              <Link href="/shop" className="btn btn-secondary mt-6">
                Start shopping
              </Link>
            </div>
          ) : (
            <ul className="divide-y border-y">
              {orders.map((order) => {
                const pieces = order.items.reduce((total, item) => total + item.quantity, 0);
                return (
                  <li key={order.id} className="relative transition-colors hover:bg-surface">
                    <div className="grid grid-cols-2 items-center gap-x-6 gap-y-2 py-5 sm:grid-cols-[1fr_1fr_1fr_auto_auto] sm:px-3">
                      <div>
                        <p className="type-small">{orderReference(order.id)}</p>
                        <p className="type-small text-ink-muted">
                          <time dateTime={order.createdAt.toISOString()}>
                            {orderDate.format(order.createdAt)}
                          </time>
                        </p>
                      </div>
                      <p className="text-right sm:text-left">
                        <OrderStatusLabel status={order.status} />
                      </p>
                      <p className="type-small text-ink-muted">
                        {pieces} {pieces === 1 ? "piece" : "pieces"}
                      </p>
                      <p className="type-price text-right">{formatPrice(order.totalCents / 100)}</p>
                      <p className="type-label">
                        {/* Stretched link: the whole row opens the order. */}
                        <Link
                          href={`/account/orders/${order.id}`}
                          className="link after:absolute after:inset-0"
                        >
                          View<span className="sr-only"> order {orderReference(order.id)}</span>
                        </Link>
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 py-4">
      <dt className="type-label text-ink-muted">{label}</dt>
      <dd className="type-body">{value}</dd>
    </div>
  );
}
