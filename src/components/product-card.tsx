import Image from "next/image";
import Link from "next/link";
import { Price } from "@/components/price";
import { isNew, isOnSale, productStock, type Product } from "@/lib/product";

export function ProductCard({ product }: { product: Product }) {
  const soldOut = productStock(product).status === "out-of-stock";
  const badge = soldOut
    ? "Sold out"
    : isOnSale(product)
      ? "Sale"
      : (product.badge ?? (isNew(product) ? "New" : undefined));

  return (
    <article className="group relative">
      <div className="media-frame">
        <Image
          src={product.images[0].src}
          alt={product.images[0].alt}
          fill
          sizes="(min-width: 80rem) 25vw, (min-width: 48rem) 33vw, 50vw"
          className="transition-transform duration-700 group-hover:scale-[1.03]"
        />
        {badge && (
          <span className="type-label absolute top-3 left-3 bg-canvas px-2 py-1">
            {badge}
          </span>
        )}
      </div>

      <div className="mt-3 space-y-1 pr-2">
        <p className="type-label text-ink-muted">{product.category.name}</p>
        <h3 className="type-small">
          {/* Stretched link: the whole card is one click target. */}
          <Link
            href={`/products/${product.slug}`}
            className="link-quiet after:absolute after:inset-0"
          >
            {product.name}
          </Link>
        </h3>
        <Price product={product} className="type-price" />
      </div>
    </article>
  );
}
