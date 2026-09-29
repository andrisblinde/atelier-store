"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { addToBag } from "@/app/bag/actions";
import { BAG_CHANGE_EVENT, bagErrorMessage } from "@/lib/cart";
import { stockState, type ProductSize } from "@/lib/product";

type ProductPurchaseProps = {
  productId: string;
  sizes: ProductSize[];
  oneSize: boolean;
};

/*
 * Size selection and "Add to bag". Stock shown here comes from the ISR page and
 * can be minutes old; addToBag checks live stock and may clamp or refuse.
 */
export function ProductPurchase({ productId, sizes, oneSize }: ProductPurchaseProps) {
  const [selected, setSelected] = useState<string | null>(oneSize ? sizes[0].label : null);
  const [error, setError] = useState(false);
  const [status, setStatus] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const soldOut = sizes.every((size) => size.stock <= 0);
  const selectedSize = sizes.find((size) => size.label === selected);
  const selectedStock = selectedSize && stockState(selectedSize.stock);

  if (soldOut) {
    return (
      <div className="space-y-3">
        <button type="button" className="btn btn-primary w-full" disabled>
          Out of stock
        </button>
        <p className="type-small text-ink-muted">
          This piece is currently unavailable.{" "}
          <Link href="/contact" className="link">
            Contact client services
          </Link>{" "}
          to hear when it returns.
        </p>
      </div>
    );
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        if (!selected) {
          setError(true);
          return;
        }
        startTransition(async () => {
          const result = await addToBag(productId, selected, 1);
          window.dispatchEvent(new Event(BAG_CHANGE_EVENT));
          setStatus(
            !result.ok
              ? { tone: "error", text: bagErrorMessage[result.reason] }
              : result.clamped
                ? {
                    tone: "error",
                    text: `Only ${result.available} available${oneSize ? "" : ` in ${selected}`}. Your bag has ${result.quantity}.`,
                  }
                : {
                    tone: "success",
                    text: `Added to your bag${oneSize ? "" : ` in size ${selected}`}.`,
                  },
          );
        });
      }}
    >
      {!oneSize && (
        <fieldset>
          <div className="mb-3 flex items-baseline justify-between">
            <legend className="type-label">
              Size{selected && <span className="text-ink-muted">: {selected}</span>}
            </legend>
            <Link href="/size-guide" className="type-small link text-ink-muted">
              Size guide
            </Link>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {sizes.map((size) => {
              const unavailable = size.stock <= 0;
              return (
                <label
                  key={size.label}
                  className={`type-small relative flex min-h-12 items-center justify-center border transition-colors has-checked:border-line-strong has-checked:bg-ink has-checked:text-canvas has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink ${
                    unavailable
                      ? "cursor-not-allowed text-ink-subtle line-through"
                      : "cursor-pointer hover:border-line-strong"
                  }`}
                >
                  <input
                    type="radio"
                    name="size"
                    value={size.label}
                    disabled={unavailable}
                    checked={selected === size.label}
                    onChange={() => {
                      setSelected(size.label);
                      setError(false);
                      setStatus(null);
                    }}
                    className="sr-only"
                  />
                  {size.label}
                  {unavailable && <span className="sr-only">, out of stock</span>}
                </label>
              );
            })}
          </div>

          <div aria-live="polite" className="type-small mt-3 min-h-6">
            {error ? (
              <p className="text-sale">Please select a size.</p>
            ) : selectedStock?.status === "low-stock" ? (
              <p className="text-sale">
                Only {selectedStock.remaining} left in {selected}.
              </p>
            ) : null}
          </div>
        </fieldset>
      )}

      <div className="space-y-3">
        <button type="submit" className="btn btn-primary w-full" disabled={pending}>
          {pending ? "Adding…" : "Add to bag"}
        </button>
        <p
          role="status"
          className={`type-small ${status?.tone === "error" ? "text-sale" : "text-success"}`}
        >
          {status?.text}
          {status?.tone === "success" && (
            <>
              {" "}
              <Link href="/bag" className="link">
                View bag
              </Link>
            </>
          )}
        </p>
      </div>
    </form>
  );
}
