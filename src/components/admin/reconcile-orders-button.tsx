"use client";

import { useState, useTransition } from "react";
import { reconcileOrders } from "@/app/admin/actions";

export function ReconcileOrdersButton() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const { checked, changed } = await reconcileOrders();
            setResult(`Checked ${checked} stale order${checked === 1 ? "" : "s"}, updated ${changed}.`);
          })
        }
      >
        {pending ? "Reconciling…" : "Reconcile orders with Stripe"}
      </button>
      <p role="status" className="type-small text-ink-muted">
        {result}
      </p>
    </div>
  );
}
