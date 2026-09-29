"use client";

import { useState, useTransition } from "react";
import { removeBagLine, updateBagLine } from "@/app/bag/actions";
import { BAG_CHANGE_EVENT, bagErrorMessage, type BagActionResult } from "@/lib/cart";

type BagLineControlsProps = {
  productId: string;
  size: string;
  name: string;
  quantity: number;
  /* Live stock; "+" stops here. The server clamps regardless. */
  available: number;
  unavailable: boolean;
};

/* Quantity stepper and remove button for one bag line. */
export function BagLineControls({
  productId,
  size,
  name,
  quantity,
  available,
  unavailable,
}: BagLineControlsProps) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const run = (action: () => Promise<BagActionResult>) =>
    startTransition(async () => {
      const result = await action();
      window.dispatchEvent(new Event(BAG_CHANGE_EVENT));
      setMessage(
        !result.ok
          ? bagErrorMessage[result.reason]
          : result.clamped
            ? `Only ${result.available} available.`
            : null,
      );
    });

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-4">
        {!unavailable && (
          <div
            role="group"
            aria-label={`Quantity of ${name}`}
            className="inline-flex items-center border"
          >
            <button
              type="button"
              className="btn btn-icon btn-sm"
              aria-label="Decrease quantity"
              disabled={pending}
              onClick={() => run(() => updateBagLine(productId, size, quantity - 1))}
            >
              −
            </button>
            <span aria-live="polite" className="type-price min-w-8 text-center">
              {quantity}
            </span>
            <button
              type="button"
              className="btn btn-icon btn-sm"
              aria-label="Increase quantity"
              disabled={pending || quantity >= available}
              onClick={() => run(() => updateBagLine(productId, size, quantity + 1))}
            >
              +
            </button>
          </div>
        )}
        <button
          type="button"
          className="type-small link text-ink-muted"
          disabled={pending}
          onClick={() => run(() => removeBagLine(productId, size))}
        >
          Remove<span className="sr-only"> {name}</span>
        </button>
      </div>
      {message && (
        <p role="status" className="type-small text-sale">
          {message}
        </p>
      )}
    </div>
  );
}
