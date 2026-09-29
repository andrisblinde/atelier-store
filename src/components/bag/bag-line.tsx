import Image from "next/image";
import Link from "next/link";
import { BagLineControls } from "@/components/bag/bag-line-controls";
import { Price } from "@/components/price";
import type { BagLineView } from "@/db/queries/cart";
import { formatPrice } from "@/lib/product";

export function BagLine({ line }: { line: BagLineView }) {
  const { product } = line;
  const unavailable = line.status === "unavailable";
  const name = product?.name ?? "Unavailable piece";

  return (
    <li className="grid grid-cols-[5.5rem_1fr] gap-4 py-6 sm:grid-cols-[7rem_1fr] sm:gap-6">
      <div className={`media-frame ${unavailable ? "opacity-50" : ""}`}>
        {product && (
          <Image src={product.image.src} alt={product.image.alt} fill sizes="7rem" />
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-1">
          <div className="min-w-0 space-y-1">
            {product && <p className="type-label text-ink-muted">{product.categoryName}</p>}
            <h2 className="type-small">
              {product ? (
                <Link href={`/products/${product.slug}`} className="link-quiet">
                  {product.name}
                </Link>
              ) : (
                name
              )}
            </h2>
            {product && !product.oneSize && (
              <p className="type-small text-ink-muted">Size: {line.size}</p>
            )}
            {product && <Price product={product} className="type-price text-ink-muted" />}
          </div>
          {!unavailable && (
            <p className="type-price">
              <span className="sr-only">Line total </span>
              {formatPrice(line.lineTotal)}
            </p>
          )}
        </div>

        {line.status === "reduced" && (
          <p className="type-small text-sale">
            Only {line.available} left, so we&apos;ve reduced your quantity from {line.requested}.
          </p>
        )}
        {unavailable && (
          <p className="type-small text-sale">
            {product ? "Sold out in this size." : "This piece is no longer available."} It isn&apos;t
            included in your subtotal.
          </p>
        )}

        <BagLineControls
          productId={line.productId}
          size={line.size}
          name={name}
          quantity={line.quantity}
          available={line.available}
          unavailable={unavailable}
        />
      </div>
    </li>
  );
}
