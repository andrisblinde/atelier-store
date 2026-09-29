"use client";

import { useId, useState } from "react";

// Not wired to a mailing provider yet: submitting only confirms locally.
export function NewsletterForm() {
  const [submitted, setSubmitted] = useState(false);
  const inputId = useId();

  if (submitted) {
    return (
      <p role="status" className="type-body text-success">
        Thank you. You&rsquo;re on the list.
      </p>
    );
  }

  return (
    <form
      className="flex flex-col gap-3 sm:flex-row"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <label htmlFor={inputId} className="sr-only">
        Email address
      </label>
      <input
        id={inputId}
        type="email"
        name="email"
        required
        autoComplete="email"
        placeholder="Email address"
        className="type-body min-h-12 flex-1 border border-line-strong bg-canvas px-4 placeholder:text-ink-subtle"
      />
      <button type="submit" className="btn btn-primary">
        Subscribe
      </button>
    </form>
  );
}
