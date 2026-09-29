/*
 * Server-only product data access. The database is the single source of
 * truth for products; never import this from a client component.
 */
import { cache } from "react";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import type { Product } from "@/lib/product";

const withRelations = {
  category: true,
  stock: { orderBy: (stock, { asc }) => [asc(stock.position)] },
} as const satisfies NonNullable<Parameters<typeof db.query.products.findMany>[0]>["with"];

type ProductRow = NonNullable<
  Awaited<ReturnType<typeof db.query.products.findFirst<{ with: typeof withRelations }>>>
>;

function toProduct(row: ProductRow): Product {
  const [firstImage, ...otherImages] = row.images;
  if (!firstImage) throw new Error(`Product "${row.slug}" has no images`);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: { id: row.category.id, slug: row.category.slug, name: row.category.name },
    price: row.price / 100,
    compareAtPrice: row.compareAtPrice === null ? undefined : row.compareAtPrice / 100,
    badge: row.badge ?? undefined,
    colour: row.colour,
    description: row.description,
    details: row.details,
    sizes: row.stock.map((stock) => ({ label: stock.size, stock: stock.quantity })),
    images: [firstImage, ...otherImages],
  };
}

export async function getNewArrivals(limit = 8) {
  const rows = await db.query.products.findMany({
    with: withRelations,
    orderBy: (products, { desc }) => [desc(products.createdAt)],
    limit,
  });
  return rows.map(toProduct);
}

/* Cached per request so generateMetadata and the page share one query. */
export const getProductBySlug = cache(async (slug: string) => {
  const row = await db.query.products.findFirst({
    with: withRelations,
    where: (products, { eq }) => eq(products.slug, slug),
  });
  return row ? toProduct(row) : undefined;
});

export async function getProductSlugs() {
  return db.query.products.findMany({ columns: { slug: true } });
}

/* Same category first, then the newest of the rest. */
export async function getRelatedProducts(product: Product, limit = 4) {
  const rows = await db.query.products.findMany({
    with: withRelations,
    where: (products, { ne }) => ne(products.id, product.id),
    orderBy: (products, { desc }) => [
      sql`${products.categoryId} = ${product.category.id} desc`,
      desc(products.createdAt),
    ],
    limit,
  });
  return rows.map(toProduct);
}
