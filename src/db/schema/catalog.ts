import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export type ProductImageData = { src: string; alt: string };

export const categories = pgTable("categories", {
  id: uuid().primaryKey().defaultRandom(),
  slug: text().notNull().unique(),
  name: text().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const products = pgTable(
  "products",
  {
    id: uuid().primaryKey().defaultRandom(),
    slug: text().notNull().unique(),
    name: text().notNull(),
    /* Prices are stored in minor units (cents). */
    price: integer().notNull(),
    compareAtPrice: integer("compare_at_price"),
    badge: text(),
    colour: text().notNull(),
    description: text().notNull(),
    details: text().array().notNull().default(sql`'{}'::text[]`),
    images: jsonb().$type<ProductImageData[]>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("products_created_at_idx").on(t.createdAt),
    check("products_price_check", sql`${t.price} >= 0`),
    check("products_compare_at_price_check", sql`${t.compareAtPrice} >= 0`),
    check("products_images_check", sql`jsonb_array_length(${t.images}) > 0`),
  ],
);

/*
 * Many-to-many: a product belongs to its product type (Shoes, Outerwear, ...)
 * and to any other categories such as Women or Men. Exactly one membership is
 * primary: the product type, used for card labels, breadcrumbs and "related".
 */
export const productCategories = pgTable(
  "product_categories",
  {
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    isPrimary: boolean("is_primary").notNull().default(false),
  },
  (t) => [
    primaryKey({ columns: [t.productId, t.categoryId] }),
    index("product_categories_category_id_idx").on(t.categoryId),
    uniqueIndex("product_categories_one_primary_idx")
      .on(t.productId)
      .where(sql`${t.isPrimary}`),
  ],
);

/* Quantity on hand per size. One-size pieces have a single "One size" row. */
export const productStock = pgTable(
  "product_stock",
  {
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    size: text().notNull(),
    quantity: integer().notNull().default(0),
    position: smallint().notNull().default(0),
  },
  (t) => [
    primaryKey({ columns: [t.productId, t.size] }),
    check("product_stock_quantity_check", sql`${t.quantity} >= 0`),
  ],
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  productCategories: many(productCategories),
}));

export const productsRelations = relations(products, ({ many }) => ({
  productCategories: many(productCategories),
  stock: many(productStock),
}));

export const productCategoriesRelations = relations(productCategories, ({ one }) => ({
  product: one(products, { fields: [productCategories.productId], references: [products.id] }),
  category: one(categories, {
    fields: [productCategories.categoryId],
    references: [categories.id],
  }),
}));

export const productStockRelations = relations(productStock, ({ one }) => ({
  product: one(products, { fields: [productStock.productId], references: [products.id] }),
}));
