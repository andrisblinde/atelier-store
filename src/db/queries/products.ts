/*
 * Server-only product data access. The database is the single source of
 * truth for products; never import this from a client component.
 */
import { cache } from "react";
import {
  and,
  asc,
  count,
  countDistinct,
  desc,
  eq,
  gt,
  gte,
  inArray,
  lte,
  max,
  min,
  ne,
  or,
  sql,
  type AnyColumn,
  type SQL,
} from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
  productCategories,
  products,
  productStock,
  type ProductImageData,
} from "@/db/schema";
import type { Product } from "@/lib/product";
import type { SearchState } from "@/lib/search";
import { compareSizes, PAGE_SIZE, type ShopFilters } from "@/lib/shop-filters";

const withRelations = {
  // Primary (product type) first.
  productCategories: {
    columns: { isPrimary: true },
    with: { category: { columns: { id: true, slug: true, name: true } } },
    orderBy: (membership, { desc }) => [desc(membership.isPrimary)],
  },
  stock: { orderBy: (stock, { asc }) => [asc(stock.position)] },
} as const satisfies NonNullable<Parameters<typeof db.query.products.findMany>[0]>["with"];

type ProductRow = NonNullable<
  Awaited<ReturnType<typeof db.query.products.findFirst<{ with: typeof withRelations }>>>
>;

function toProduct(row: ProductRow): Product {
  const [firstImage, ...otherImages] = row.images;
  if (!firstImage) throw new Error(`Product "${row.slug}" has no images`);
  const primary = row.productCategories.find((membership) => membership.isPrimary);
  if (!primary) throw new Error(`Product "${row.slug}" has no primary category`);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: primary.category,
    categories: row.productCategories.map((membership) => membership.category),
    price: row.price / 100,
    compareAtPrice: row.compareAtPrice === null ? undefined : row.compareAtPrice / 100,
    badge: row.badge ?? undefined,
    colour: row.colour,
    description: row.description,
    details: row.details,
    sizes: row.stock.map((stock) => ({ label: stock.size, stock: stock.quantity })),
    images: [firstImage, ...otherImages],
    createdAt: row.createdAt,
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

/* Catalogue totals for the admin overview. */
export async function getCatalogueCounts() {
  const [[productRow], [categoryRow]] = await db.batch([
    db.select({ total: count() }).from(products),
    db.select({ total: count() }).from(categories),
  ]);
  return { products: productRow?.total ?? 0, categories: categoryRow?.total ?? 0 };
}

/* Cached per request so generateMetadata and the page share one query. */
export const getCategoryBySlug = cache(async (slug: string) =>
  db.query.categories.findFirst({
    columns: { id: true, slug: true, name: true },
    where: (categories, { eq }) => eq(categories.slug, slug),
  }),
);

/*
 * Every category with its product count and the newest product's first image,
 * for the /shop entry point. A category that is some product's primary is a
 * product type (Shoes, Outerwear, ...); one that never is groups products
 * across types (Women, Men).
 */
export async function getShopCategories() {
  return db
    .select({
      id: categories.id,
      slug: categories.slug,
      name: categories.name,
      productCount: sql<number>`count(${productCategories.productId})::int`,
      isProductType: sql<boolean>`coalesce(bool_or(${productCategories.isPrimary}), false)`,
      image: sql<ProductImageData | null>`(
        select p.images -> 0 from products p
        join product_categories m on m.product_id = p.id
        where m.category_id = ${categories.id}
        order by p.created_at desc limit 1
      )`,
    })
    .from(categories)
    .leftJoin(productCategories, eq(productCategories.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.name));
}

const categoryMembers = (categoryId: string) =>
  db
    .select({ productId: productCategories.productId })
    .from(productCategories)
    .where(eq(productCategories.categoryId, categoryId));

export type CategoryFacets = {
  sizes: string[];
  colours: { value: string; count: number }[];
  /* Whole currency units. */
  price: { min: number; max: number } | null;
  /*
   * Other categories to narrow by. On a product-type page these are groupings
   * (Women, Men); on a grouping page they are product types.
   */
  categories: { slug: string; name: string; count: number }[];
  isProductType: boolean;
};

/* Filter options for a category, computed in the database in one round trip. */
export async function getCategoryFacets(categoryId: string): Promise<CategoryFacets> {
  const members = categoryMembers(categoryId);
  const isProductType = sql<boolean>`(
    select coalesce(bool_or(is_primary), false) from product_categories where category_id = ${categoryId}
  )`;

  const [sizeRows, colourRows, [priceRow], categoryRows, [kindRow]] = await db.batch([
    db
      .selectDistinct({ size: productStock.size })
      .from(productStock)
      .where(inArray(productStock.productId, members)),
    db
      .select({ value: products.colour, count: count() })
      .from(products)
      .where(inArray(products.id, members))
      .groupBy(products.colour)
      .orderBy(asc(products.colour)),
    db
      .select({ min: min(products.price), max: max(products.price) })
      .from(products)
      .where(inArray(products.id, members)),
    db
      .select({ slug: categories.slug, name: categories.name, count: countDistinct(productCategories.productId) })
      .from(productCategories)
      .innerJoin(categories, eq(categories.id, productCategories.categoryId))
      .where(
        and(
          inArray(productCategories.productId, members),
          ne(productCategories.categoryId, categoryId),
          // Product-type page: offer groupings; grouping page: offer product types.
          sql`${productCategories.isPrimary} <> ${isProductType}`,
        ),
      )
      .groupBy(categories.id)
      .orderBy(asc(categories.name)),
    db
      .select({ value: sql<boolean>`coalesce(bool_or(${productCategories.isPrimary}), false)` })
      .from(productCategories)
      .where(eq(productCategories.categoryId, categoryId)),
  ]);

  return {
    sizes: sizeRows.map((row) => row.size).sort(compareSizes),
    colours: colourRows,
    price:
      priceRow?.min != null && priceRow.max != null
        ? { min: Math.floor(priceRow.min / 100), max: Math.ceil(priceRow.max / 100) }
        : null,
    categories: categoryRows,
    isProductType: kindRow?.value ?? false,
  };
}

/*
 * One page of a category's products with filters and sorting applied in SQL.
 * Only the page's ids are selected; full rows are loaded for those ids alone.
 */
export async function getCategoryProducts(categoryId: string, filters: ShopFilters) {
  const conditions: SQL[] = [inArray(products.id, categoryMembers(categoryId))];

  if (filters.categories.length > 0) {
    conditions.push(
      inArray(
        products.id,
        db
          .select({ productId: productCategories.productId })
          .from(productCategories)
          .innerJoin(categories, eq(categories.id, productCategories.categoryId))
          .where(inArray(categories.slug, filters.categories)),
      ),
    );
  }
  if (filters.sizes.length > 0) {
    conditions.push(
      inArray(
        products.id,
        db
          .select({ productId: productStock.productId })
          .from(productStock)
          .where(and(inArray(productStock.size, filters.sizes), gt(productStock.quantity, 0))),
      ),
    );
  } else if (filters.inStock) {
    // A size filter already requires stock in that size, so this only applies without one.
    conditions.push(
      inArray(
        products.id,
        db
          .select({ productId: productStock.productId })
          .from(productStock)
          .where(gt(productStock.quantity, 0)),
      ),
    );
  }
  if (filters.colours.length > 0) conditions.push(inArray(products.colour, filters.colours));
  if (filters.minPrice !== undefined) conditions.push(gte(products.price, filters.minPrice * 100));
  if (filters.maxPrice !== undefined) conditions.push(lte(products.price, filters.maxPrice * 100));

  const where = and(...conditions);
  const order = {
    newest: [desc(products.createdAt), asc(products.id)],
    "price-asc": [asc(products.price), desc(products.createdAt), asc(products.id)],
    "price-desc": [desc(products.price), desc(products.createdAt), asc(products.id)],
  }[filters.sort];

  const [pageRows, [totalRow]] = await db.batch([
    db
      .select({ id: products.id })
      .from(products)
      .where(where)
      .orderBy(...order)
      .limit(PAGE_SIZE)
      .offset((filters.page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(products).where(where),
  ]);

  return {
    products: await getProductsInOrder(pageRows.map((row) => row.id)),
    total: totalRow?.total ?? 0,
  };
}

/* Full products for a page of ids, in the ids' order. */
async function getProductsInOrder(ids: string[]) {
  if (ids.length === 0) return [];
  const rows = await db.query.products.findMany({
    with: withRelations,
    where: (products, { inArray }) => inArray(products.id, ids),
  });
  const byId = new Map(rows.map((row) => [row.id, toProduct(row)]));
  return ids.flatMap((id) => byId.get(id) ?? []);
}

/*
 * Case-insensitive Postgres regex matching the term at the start of a word
 * (\m), so "men" does not match "women" but "boot" matches "boots". Regex
 * metacharacters in user input are escaped so they match literally.
 */
const wordStart = (term: string) => `\\m${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`;
const matches = (column: SQL | AnyColumn, term: string) =>
  sql`${column} ~* ${wordStart(term)}`;

/*
 * Every term must start a word in the name, colour, description, details or
 * one of the product's category names (so "women coat" or "black silk" work).
 * "Relevance" puts products whose name contains the whole query first.
 * Filtering, counting and paging run in SQL, one page at a time.
 */
export async function searchProducts({ query, terms, sort, page }: SearchState) {
  if (terms.length === 0) return { products: [], total: 0 };

  const where = and(
    ...terms.map((term) =>
      or(
        matches(products.name, term),
        matches(products.colour, term),
        matches(products.description, term),
        matches(sql`array_to_string(${products.details}, ' ')`, term),
        inArray(
          products.id,
          db
            .select({ productId: productCategories.productId })
            .from(productCategories)
            .innerJoin(categories, eq(categories.id, productCategories.categoryId))
            .where(matches(categories.name, term)),
        ),
      ),
    ),
  );
  const order = {
    relevance: [
      sql`(${matches(products.name, query)}) desc`,
      desc(products.createdAt),
      asc(products.id),
    ],
    newest: [desc(products.createdAt), asc(products.id)],
    "price-asc": [asc(products.price), desc(products.createdAt), asc(products.id)],
    "price-desc": [desc(products.price), desc(products.createdAt), asc(products.id)],
  }[sort];

  const [pageRows, [totalRow]] = await db.batch([
    db
      .select({ id: products.id })
      .from(products)
      .where(where)
      .orderBy(...order)
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(products).where(where),
  ]);

  return {
    products: await getProductsInOrder(pageRows.map((row) => row.id)),
    total: totalRow?.total ?? 0,
  };
}

/* In the order given; slugs with no product are skipped. */
export async function getProductsBySlugs(slugs: string[]) {
  if (slugs.length === 0) return [];
  const rows = await db.query.products.findMany({
    with: withRelations,
    where: (products, { inArray }) => inArray(products.slug, slugs),
  });
  const bySlug = new Map(rows.map((row) => [row.slug, toProduct(row)]));
  return slugs.flatMap((slug) => bySlug.get(slug) ?? []);
}

/* Same product type (primary category) first, then the newest of the rest. */
export async function getRelatedProducts(product: Product, limit = 4) {
  const rows = await db.query.products.findMany({
    with: withRelations,
    where: (products, { ne }) => ne(products.id, product.id),
    orderBy: (products, { desc }) => [
      // Plain column names: inside a relational query, interpolated columns are
      // re-qualified with the root table's alias ("products").
      sql`${products.id} in (
        select product_id from product_categories
        where category_id = ${product.category.id} and is_primary
      ) desc`,
      desc(products.createdAt),
    ],
    limit,
  });
  return rows.map(toProduct);
}
