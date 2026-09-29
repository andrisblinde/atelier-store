"use client";

import { useId, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { SORT_OPTIONS, type SortKey } from "@/lib/shop-filters";

/*
 * A plain GET form, so filtering works without JavaScript. With it, checkbox
 * and select changes apply straight away, and the URL is built without empty
 * or default values so it stays short and shareable.
 */
export function FilterForm({
  id,
  action,
  children,
}: {
  id: string;
  action: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function apply(form: HTMLFormElement) {
    const params = new URLSearchParams();
    for (const [name, value] of new FormData(form)) {
      if (typeof value !== "string" || !value.trim()) continue;
      if (name === "sort" && value === "newest") continue;
      params.append(name, value.trim());
    }
    const query = params.toString();
    startTransition(() => router.push(query ? `${action}?${query}` : action, { scroll: false }));
  }

  return (
    <div>
      <button
        type="button"
        className="btn btn-secondary w-full lg:hidden"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Hide filters" : "Filter"}
      </button>

      <form
        id={id}
        action={action}
        method="get"
        aria-busy={pending}
        aria-label="Filter products"
        className={`${open ? "block" : "hidden"} mt-4 lg:mt-0 lg:block ${pending ? "opacity-60" : ""} transition-opacity`}
        onSubmit={(event) => {
          event.preventDefault();
          apply(event.currentTarget);
        }}
        onChange={(event) => {
          // Price fields apply on Enter or with their button, not on every keystroke.
          if (event.target instanceof HTMLInputElement && event.target.type === "number") return;
          event.currentTarget.requestSubmit();
        }}
      >
        {children}
      </form>
    </div>
  );
}

/* Lives in the results toolbar but belongs to the filter form via `form`. */
export function SortSelect({ form, value }: { form: string; value: SortKey }) {
  const id = useId();
  return (
    <div className="flex items-center gap-3">
      <label htmlFor={id} className="type-label text-ink-muted">
        Sort
      </label>
      <select
        id={id}
        name="sort"
        form={form}
        defaultValue={value}
        className="type-small min-h-10 border border-line-strong bg-canvas px-3"
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
