import type { OrderStatus } from "@/db/schema";

const labels: Record<OrderStatus, { label: string; tone: string }> = {
  paid: { label: "Paid", tone: "text-success" },
  processing: { label: "Payment processing", tone: "text-ink-muted" },
  payment_failed: { label: "Payment failed", tone: "text-sale" },
  pending: { label: "Awaiting payment", tone: "text-ink-muted" },
  expired: { label: "Expired", tone: "text-ink-muted" },
  canceled: { label: "Canceled", tone: "text-ink-muted" },
};

export function OrderStatusLabel({ status }: { status: OrderStatus }) {
  const { label, tone } = labels[status];
  return <span className={`type-label ${tone}`}>{label}</span>;
}

/* Short, readable order reference, e.g. "A5ED2B80". */
export const orderReference = (id: string) => id.slice(0, 8).toUpperCase();
