import type { StockState } from "@/lib/product";

const styles = {
  "in-stock": { text: "text-success", dot: "bg-success" },
  "low-stock": { text: "text-sale", dot: "bg-sale" },
  "out-of-stock": { text: "text-ink-muted", dot: "bg-ink-subtle" },
} as const;

export function stockLabel(state: StockState) {
  switch (state.status) {
    case "in-stock":
      return "In stock";
    case "low-stock":
      return `Low stock: only ${state.remaining} left`;
    case "out-of-stock":
      return "Out of stock";
  }
}

export function StockStatus({ state, className = "" }: { state: StockState; className?: string }) {
  const style = styles[state.status];

  return (
    <p className={`type-small flex items-center gap-2 ${style.text} ${className}`}>
      <span aria-hidden="true" className={`size-1.5 rounded-full ${style.dot}`} />
      {stockLabel(state)}
    </p>
  );
}
