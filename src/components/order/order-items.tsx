import Image from "next/image";
import Link from "next/link";
import type { ProductImageData } from "@/db/schema";
import { formatPrice } from "@/lib/product";

export type OrderItemView = {
  size: string;
  quantity: number;
  unitPriceCents: number;
  productName: string;
  productSlug: string;
  image: ProductImageData;
};

/* The pieces in an order, from the order's snapshots (not the live catalogue). */
export function OrderItems({ items }: { items: OrderItemView[] }) {
  return (
    <ul className="divide-y border-y">
      {items.map((item) => (
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
          <p className="type-price">{formatPrice((item.unitPriceCents * item.quantity) / 100)}</p>
        </li>
      ))}
    </ul>
  );
}
