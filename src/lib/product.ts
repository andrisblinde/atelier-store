/*
 * Product types and pure helpers shared by server and client components.
 * Product data itself comes from the database (src/db/queries/products.ts).
 */

export type ProductImage = { src: string; alt: string };

export type ProductSize = { label: string; stock: number };

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: { id: string; slug: string; name: string };
  /* Whole currency units; the database stores cents. */
  price: number;
  compareAtPrice?: number;
  badge?: string;
  colour: string;
  description: string;
  details: string[];
  /* One-size pieces have a single "One size" entry. */
  sizes: ProductSize[];
  images: [ProductImage, ...ProductImage[]];
};

export type StockState =
  | { status: "in-stock" }
  | { status: "low-stock"; remaining: number }
  | { status: "out-of-stock" };

const LOW_STOCK_THRESHOLD = 3;

export function stockState(stock: number): StockState {
  if (stock <= 0) return { status: "out-of-stock" };
  if (stock <= LOW_STOCK_THRESHOLD) return { status: "low-stock", remaining: stock };
  return { status: "in-stock" };
}

export const productStock = (product: Product) =>
  stockState(product.sizes.reduce((total, size) => total + size.stock, 0));

export const isOneSize = (product: Product) =>
  product.sizes.length === 1 && product.sizes[0].label === "One size";

export const isOnSale = (product: Product) =>
  product.compareAtPrice !== undefined && product.compareAtPrice > product.price;

const priceFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatPrice = (amount: number) => priceFormat.format(amount);
