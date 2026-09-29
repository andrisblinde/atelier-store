import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { products, type ProductImageData } from "./catalog";

/*
 * pending         checkout started, stock reserved, awaiting payment
 * processing      Checkout completed with a delayed payment method, stock still reserved
 * paid            payment confirmed by Stripe (webhook or API), stock sold
 * payment_failed  delayed payment failed, stock released
 * expired         Checkout Session expired unpaid, stock released
 * canceled        abandoned from our side (back link, newer checkout, Stripe error), stock released
 */
export const orderStatus = pgEnum("order_status", [
  "pending",
  "processing",
  "paid",
  "payment_failed",
  "expired",
  "canceled",
]);

export type OrderStatus = (typeof orderStatus.enumValues)[number];

export const orders = pgTable(
  "orders",
  {
    id: uuid().primaryKey().defaultRandom(),
    /* Null for guest checkouts. */
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    /* The signed-in email at creation, replaced by Stripe's customer email on payment. */
    email: text(),
    status: orderStatus().notNull().default("pending"),
    currency: text().notNull().default("usd"),
    /* Minor units (cents), computed from database prices when checkout starts. */
    subtotalCents: integer("subtotal_cents").notNull(),
    totalCents: integer("total_cents").notNull(),
    stripeCheckoutSessionId: text("stripe_checkout_session_id").unique(),
    stripePaymentIntentId: text("stripe_payment_intent_id").unique(),
    /* True while this order holds stock; set false in the same statement that restocks. */
    stockReserved: boolean("stock_reserved").notNull().default(true),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    /* Paid but the stock could not be re-reserved, or Stripe's amount did not match. */
    needsReview: boolean("needs_review").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("orders_status_created_at_idx").on(t.status, t.createdAt),
    index("orders_user_id_created_at_idx").on(t.userId, t.createdAt),
    check("orders_subtotal_cents_check", sql`${t.subtotalCents} >= 0`),
    check("orders_total_cents_check", sql`${t.totalCents} >= 0`),
  ],
);

/* Snapshots of what was bought, so history survives catalogue edits and deletions. */
export const orderItems = pgTable(
  "order_items",
  {
    id: uuid().primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
    size: text().notNull(),
    quantity: integer().notNull(),
    unitPriceCents: integer("unit_price_cents").notNull(),
    productName: text("product_name").notNull(),
    productSlug: text("product_slug").notNull(),
    image: jsonb().$type<ProductImageData>().notNull(),
  },
  (t) => [
    uniqueIndex("order_items_order_product_size_idx").on(t.orderId, t.productId, t.size),
    check("order_items_quantity_check", sql`${t.quantity} > 0`),
    check("order_items_unit_price_cents_check", sql`${t.unitPriceCents} >= 0`),
  ],
);

/* Every Stripe webhook event received, keyed by event id, for deduplication and auditing. */
export const stripeEvents = pgTable("stripe_events", {
  id: text().primaryKey(),
  type: text().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
});

export const ordersRelations = relations(orders, ({ many, one }) => ({
  items: many(orderItems),
  user: one(user, { fields: [orders.userId], references: [user.id] }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));
