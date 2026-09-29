import type { Metadata } from "next";
import Link from "next/link";
import { BagLine } from "@/components/bag/bag-line";
import { CheckoutButton } from "@/components/bag/checkout-button";
import { ListingHeader } from "@/components/product-listing";
import { getBagDetails } from "@/db/queries/cart";
import { readBag } from "@/lib/bag-cookie";
import { formatPrice } from "@/lib/product";

export const metadata: Metadata = {
  title: "Your bag",
  robots: { index: false, follow: false },
};

/*
 * Reads the bag cookie, so this page renders per request. Prices and stock
 * are read live; quantities above stock are shown (and totalled) reduced, and
 * the cookie is corrected by the next bag action.
 */
export default async function BagPage({ searchParams }: PageProps<"/bag">) {
  const bag = await getBagDetails(await readBag());
  const canceled = (await searchParams).checkout === "canceled";
  const canceledNotice = canceled && (
    <p role="status" className="type-small mb-6 border p-4">
      Checkout was canceled and you haven&apos;t been charged. Your bag is saved below.
    </p>
  );

  if (bag.lines.length === 0) {
    return (
      <main id="main">
        <ListingHeader eyebrow="Shopping bag" title="Your bag" intro="Your bag is empty." />
        <div className="container-page pb-section">
          <Link href="/shop" className="btn btn-primary">
            Continue shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main id="main">
      <ListingHeader
        eyebrow="Shopping bag"
        title="Your bag"
        intro={`${bag.itemCount} ${bag.itemCount === 1 ? "piece" : "pieces"} in your bag.`}
      />

      <div className="container-page grid items-start gap-10 pb-section lg:grid-cols-[1fr_22rem] lg:gap-16">
        <section aria-label="Items">
          {canceledNotice}
          {bag.hasIssues && (
            <p role="status" className="type-small mb-6 border border-sale p-4 text-sale">
              Some pieces have sold out or have limited stock since you added them. Your bag has
              been updated below.
            </p>
          )}
          <ul className="divide-y border-y">
            {bag.lines.map((line) => (
              <BagLine key={`${line.productId}:${line.size}`} line={line} />
            ))}
          </ul>
        </section>

        <aside
          aria-labelledby="summary-heading"
          className="bg-surface p-6 lg:sticky lg:top-[calc(var(--spacing-header)+1.5rem)]"
        >
          <h2 id="summary-heading" className="type-h3">
            Summary
          </h2>
          <dl className="mt-6 space-y-3 border-b pb-6">
            <div className="flex justify-between gap-4">
              <dt className="type-small">Subtotal</dt>
              <dd className="type-price">{formatPrice(bag.subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="type-small text-ink-muted">Shipping</dt>
              <dd className="type-small text-ink-muted">Complimentary</dd>
            </div>
          </dl>
          <CheckoutButton disabled={bag.hasIssues} />
          <p className="type-small text-ink-muted">
            {bag.hasIssues
              ? "Update or remove the highlighted pieces to continue."
              : "You'll pay securely with Stripe. Your pieces are held for 30 minutes."}
          </p>
          <Link href="/shop" className="btn btn-secondary mt-6 w-full">
            Continue shopping
          </Link>
        </aside>
      </div>
    </main>
  );
}
