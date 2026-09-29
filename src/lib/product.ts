/*
 * Product types and pure helpers shared by server and client components.
 * Product data itself comes from the database (src/db/queries/products.ts).
 */

export type ProductImage = { src: string; alt: string };

export type ProductSize = { label: string; stock: number };

export type ProductCategory = { id: string; slug: string; name: string };

export type Product = {
  id: string;
  slug: string;
  name: string;
  /* Primary category: the product type (Shoes, Outerwear, ...). */
  category: ProductCategory;
  /* Every category the product belongs to, primary first (e.g. Shoes, Women). */
  categories: ProductCategory[];
  /* Whole currency units; the database stores cents. */
  price: number;
  compareAtPrice?: number;
  /* Editorial label such as "Limited edition". "New" is derived from createdAt. */
  badge?: string;
  colour: string;
  description: string;
  details: string[];
  /* One-size pieces have a single "One size" entry. */
  sizes: ProductSize[];
  images: [ProductImage, ...ProductImage[]];
  createdAt: Date;
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

const NEW_PRODUCT_DAYS = 30;

/* Added within the last NEW_PRODUCT_DAYS. ISR pages evaluate this at render time. */
export const isNew = (product: Product, now = Date.now()) =>
  now - product.createdAt.getTime() < NEW_PRODUCT_DAYS * 24 * 60 * 60 * 1000;

const priceFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatPrice = (amount: number) => priceFormat.format(amount);
