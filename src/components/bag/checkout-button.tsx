"use client";

import { useState, useTransition } from "react";
import { startCheckout, type CheckoutError } from "@/app/checkout/actions";

const messages: Record<CheckoutError, string> = {
  empty: "Your bag is empty.",
  "bag-changed": "Some pieces in your bag have changed. Please review your bag before checking out.",
  "sold-out": "Sorry, a piece in your bag has just sold out. Please review your bag.",
  unavailable: "Checkout is unavailable right now. Please try again in a moment.",
};

/* Starts Stripe Checkout. On success the server action redirects to Stripe. */
export function CheckoutButton({ disabled }: { disabled: boolean }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<CheckoutError | null>(null);

  return (
    <div className="mt-6 space-y-3">
      <button
        type="button"
        className="btn btn-primary w-full"
        disabled={disabled || pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const result = await startCheckout();
            // Only reached on failure; success navigates away.
            setError(result.reason);
          })
        }
      >
        {pending ? "Preparing checkout…" : "Checkout"}
      </button>
      <p role="status" className="type-small text-sale">
        {error && messages[error]}
      </p>
    </div>
  );
}
