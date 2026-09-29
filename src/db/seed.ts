/*
 * Loads the sample catalogue into the database. Safe to re-run: categories
 * and products are upserted by slug and stock by (product, size).
 * Run with `npm run db:seed`.
 */
import { sql } from "drizzle-orm";
import { db } from "./index";
import { categories, products, productStock } from "./schema";
import { seedProducts } from "./seed-data";

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const toCents = (amount: number) => Math.round(amount * 100);

async function main() {
  const categoryNames = [...new Set(seedProducts.map((product) => product.category))];

  const categoryRows = await db
    .insert(categories)
    .values(categoryNames.map((name) => ({ slug: slugify(name), name })))
    .onConflictDoUpdate({ target: categories.slug, set: { name: sql`excluded.name` } })
    .returning({ id: categories.id, name: categories.name });
  const categoryIds = new Map(categoryRows.map((row) => [row.name, row.id]));

  // seedProducts is listed newest first; space created_at a minute apart to keep that order.
  const now = Date.now();
  const productRows = await db
    .insert(products)
    .values(
      seedProducts.map((product, i) => ({
        slug: product.slug,
        name: product.name,
        categoryId: categoryIds.get(product.category)!,
        price: toCents(product.price),
        compareAtPrice:
          product.compareAtPrice === undefined ? null : toCents(product.compareAtPrice),
        badge: product.badge ?? null,
        colour: product.colour,
        description: product.description,
        details: product.details,
        images: product.images,
        createdAt: new Date(now - i * 60_000),
      })),
    )
    .onConflictDoUpdate({
      target: products.slug,
      set: {
        name: sql`excluded.name`,
        categoryId: sql`excluded.category_id`,
        price: sql`excluded.price`,
        compareAtPrice: sql`excluded.compare_at_price`,
        badge: sql`excluded.badge`,
        colour: sql`excluded.colour`,
        description: sql`excluded.description`,
        details: sql`excluded.details`,
        images: sql`excluded.images`,
        updatedAt: sql`now()`,
      },
    })
    .returning({ id: products.id, slug: products.slug });
  const productIds = new Map(productRows.map((row) => [row.slug, row.id]));

  const stockRows = seedProducts.flatMap((product) =>
    product.sizes.map((size, position) => ({
      productId: productIds.get(product.slug)!,
      size: size.label,
      quantity: size.stock,
      position,
    })),
  );
  await db
    .insert(productStock)
    .values(stockRows)
    .onConflictDoUpdate({
      target: [productStock.productId, productStock.size],
      set: { quantity: sql`excluded.quantity`, position: sql`excluded.position` },
    });

  console.log(
    `Seeded ${categoryRows.length} categories, ${productRows.length} products, ${stockRows.length} stock rows.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
