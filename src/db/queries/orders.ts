/*
 * Server-only order data. Every status change is a conditional UPDATE
 * (WHERE status IN the allowed from-states), and every stock movement happens
 * in the same statement as the status change that causes it. Repeated or
 * concurrent calls (duplicate webhooks, webhook vs success page) are no-ops.
 */
import "server-only";
import { and, eq, inArray, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  orderItems,
  orders,
  stripeEvents,
  type OrderStatus,
  type ProductImageData,
} from "@/db/schema";

export type NewOrderItem = {
  productId: string;
  size: string;
  quantity: number;
  unitPriceCents: number;
  productName: string;
  productSlug: string;
  image: ProductImageData;
};

export class InsufficientStockError extends Error {
  constructor() {
    super("insufficient_stock");
  }
}

function isInsufficientStock(error: unknown) {
  for (let e = error; e instanceof Error; e = e.cause) {
    if (e.message.includes("insufficient_stock")) return true;
  }
  return false;
}

/*
 * Inserts a pending order with its items and reserves their stock, in one
 * transaction. Throws InsufficientStockError (and inserts nothing) if any
 * line is no longer in stock.
 */
export async function createPendingOrder(order: {
  userId: string | null;
  email: string | null;
  items: NewOrderItem[];
  expiresAt: Date;
}) {
  const id = crypto.randomUUID();
  const subtotalCents = order.items.reduce(
    (total, item) => total + item.unitPriceCents * item.quantity,
    0,
  );

  try {
    await db.batch([
      db.insert(orders).values({
        id,
        userId: order.userId,
        email: order.email,
        subtotalCents,
        totalCents: subtotalCents,
        expiresAt: order.expiresAt,
      }),
      db.insert(orderItems).values(order.items.map((item) => ({ ...item, orderId: id }))),
      db.execute(sql`select reserve_order_stock(${id}::uuid)`),
    ]);
  } catch (error) {
    if (isInsufficientStock(error)) throw new InsufficientStockError();
    throw error;
  }

  return { id, subtotalCents, totalCents: subtotalCents };
}

export async function setCheckoutSession(orderId: string, sessionId: string) {
  await db
    .update(orders)
    .set({ stripeCheckoutSessionId: sessionId })
    .where(and(eq(orders.id, orderId), sql`${orders.stripeCheckoutSessionId} is null`));
}

/*
 * Moves an order from one of `from` to `to` and puts its reserved stock back,
 * in one statement. Returns the slugs of the restocked products, or an empty
 * array if the order was not in a releasable state (already released or paid).
 */
export async function releaseOrder(orderId: string, to: OrderStatus, from: OrderStatus[]) {
  const result = await db.execute<{ product_slug: string }>(sql`
    with released as (
      update orders set status = ${to}, stock_reserved = false, updated_at = now()
      where id = ${orderId} and stock_reserved
        and status in (${sql.join(from.map((status) => sql`${status}::order_status`), sql`, `)})
      returning id
    ),
    -- Data-modifying CTEs always run; this one only matches rows if released did.
    restocked as (
      update product_stock s set quantity = s.quantity + i.quantity
      from order_items i join released r on r.id = i.order_id
      where s.product_id = i.product_id and s.size = i.size
    )
    select i.product_slug from order_items i join released r on r.id = i.order_id
  `);
  return result.rows.map((row) => row.product_slug);
}

/* pending|processing → paid. Returns true if this call made the change. */
export async function markPaid(
  orderId: string,
  payment: { paymentIntentId: string | null; email: string | null },
) {
  const rows = await db
    .update(orders)
    .set({
      status: "paid",
      paidAt: new Date(),
      stripePaymentIntentId: payment.paymentIntentId,
      ...(payment.email ? { email: payment.email } : {}),
    })
    .where(and(eq(orders.id, orderId), inArray(orders.status, ["pending", "processing"])))
    .returning({ id: orders.id });
  return rows.length > 0;
}

/*
 * Payment arrived for an order whose stock was already released (expired,
 * canceled or failed). Re-reserves the stock and marks it paid in one
 * statement; if the stock is gone, marks it paid for review instead.
 * Returns whether this call changed the order.
 */
export async function markPaidAfterRelease(
  orderId: string,
  payment: { paymentIntentId: string | null; email: string | null },
) {
  try {
    // reserve_order_stock runs once per row of repaid, so never when another
    // call already moved the order (the UPDATE's WHERE no longer matches).
    const result = await db.execute(sql`
      with repaid as (
        update orders set status = 'paid', stock_reserved = true, paid_at = now(), updated_at = now(),
          stripe_payment_intent_id = ${payment.paymentIntentId}, email = coalesce(${payment.email}, email)
        where id = ${orderId} and not stock_reserved
          and status in ('expired', 'canceled', 'payment_failed')
        returning id
      )
      select reserve_order_stock(id) from repaid
    `);
    return { changed: result.rows.length > 0, needsReview: false };
  } catch (error) {
    if (!isInsufficientStock(error)) throw error;
    // The whole statement rolled back; record the payment for manual follow-up.
    const rows = await db
      .update(orders)
      .set({
        status: "paid",
        paidAt: new Date(),
        needsReview: true,
        stripePaymentIntentId: payment.paymentIntentId,
        ...(payment.email ? { email: payment.email } : {}),
      })
      .where(
        and(eq(orders.id, orderId), inArray(orders.status, ["expired", "canceled", "payment_failed"])),
      )
      .returning({ id: orders.id });
    return { changed: rows.length > 0, needsReview: true };
  }
}

/* pending → processing (Checkout completed with a delayed payment method). */
export async function markProcessing(orderId: string, email: string | null) {
  await db
    .update(orders)
    .set({ status: "processing", ...(email ? { email } : {}) })
    .where(and(eq(orders.id, orderId), eq(orders.status, "pending")));
}

export async function flagForReview(orderId: string) {
  await db.update(orders).set({ needsReview: true }).where(eq(orders.id, orderId));
}

export async function getOrder(orderId: string) {
  return db.query.orders.findFirst({ where: (orders, { eq }) => eq(orders.id, orderId) });
}

/* The order and its items for the confirmation page, found by Checkout Session id. */
export async function getOrderBySession(sessionId: string) {
  return db.query.orders.findFirst({
    columns: { id: true, status: true, email: true, totalCents: true, currency: true, createdAt: true },
    with: {
      items: {
        columns: {
          size: true,
          quantity: true,
          unitPriceCents: true,
          productName: true,
          productSlug: true,
          image: true,
        },
      },
    },
    where: (orders, { eq }) => eq(orders.stripeCheckoutSessionId, sessionId),
  });
}

/* Orders still waiting on Stripe well after their session should have ended. */
export async function getStaleOrders(before: Date) {
  return db
    .select({ id: orders.id, status: orders.status, sessionId: orders.stripeCheckoutSessionId })
    .from(orders)
    .where(and(inArray(orders.status, ["pending", "processing"]), lt(orders.expiresAt, before)));
}

/*
 * Logs a webhook event. Returns false if it was already processed, so the
 * caller can skip it. An event that was received but not finished (the
 * handler threw) is processed again; handlers are idempotent.
 */
export async function recordStripeEvent(event: { id: string; type: string; created: number }) {
  await db
    .insert(stripeEvents)
    .values({ id: event.id, type: event.type, createdAt: new Date(event.created * 1000) })
    .onConflictDoNothing();
  const [row] = await db
    .select({ processedAt: stripeEvents.processedAt })
    .from(stripeEvents)
    .where(eq(stripeEvents.id, event.id));
  return !row?.processedAt;
}

export async function markStripeEventProcessed(eventId: string) {
  await db
    .update(stripeEvents)
    .set({ processedAt: new Date() })
    .where(eq(stripeEvents.id, eventId));
}
