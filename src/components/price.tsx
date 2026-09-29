import { formatPrice, type Product } from "@/lib/product";

type PriceProps = {
  product: Pick<Product, "price" | "compareAtPrice">;
  className?: string;
};

export function Price({ product: { price, compareAtPrice }, className }: PriceProps) {
  const onSale = compareAtPrice !== undefined && compareAtPrice > price;

  return (
    <p className={className}>
      {onSale ? (
        <>
          <span className="sr-only">Sale price </span>
          <span className="text-sale">{formatPrice(price)}</span>{" "}
          <span className="sr-only">, was </span>
          <s className="text-ink-muted">{formatPrice(compareAtPrice)}</s>
        </>
      ) : (
        formatPrice(price)
      )}
    </p>
  );
}
