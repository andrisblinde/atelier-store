"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const MIN_PASSWORD_LENGTH = 10; // matches emailAndPassword.minPasswordLength in src/lib/auth.ts

type Mode = "sign-in" | "sign-up";

/* Friendly copy for Better Auth error codes; sign-in failures stay generic. */
function errorMessage(mode: Mode, error: { status: number; code?: string }) {
  if (error.status === 429) return "Too many attempts. Please wait a minute and try again.";
  switch (error.code) {
    case "USER_ALREADY_EXISTS":
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return "An account with this email already exists. Sign in instead.";
    case "PASSWORD_TOO_SHORT":
      return `Your password needs at least ${MIN_PASSWORD_LENGTH} characters.`;
    case "PASSWORD_TOO_LONG":
      return "That password is too long.";
    case "INVALID_EMAIL":
      return "Please enter a valid email address.";
  }
  return mode === "sign-in"
    ? "Email or password is incorrect."
    : "We couldn't create your account. Please try again.";
}

/*
 * Email and password form. Requests go through /api/auth (not server actions)
 * so Better Auth's rate limiting and origin checks apply. `next` is already
 * validated on the server (safeNext).
 */
export function AuthForm({ mode, next }: { mode: Mode; next: string }) {
  const router = useRouter();
  const id = useId();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const signUp = mode === "sign-up";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    setPending(true);
    setError(null);
    const { error } = signUp
      ? await authClient.signUp.email({ name: String(form.get("name") ?? "").trim(), email, password })
      : await authClient.signIn.email({ email, password, rememberMe: true });

    if (error) {
      setError(errorMessage(mode, error));
      setPending(false);
      return;
    }
    router.replace(next);
    router.refresh();
  }

  const otherHref = `${signUp ? "/sign-in" : "/sign-up"}${next === "/account" ? "" : `?next=${encodeURIComponent(next)}`}`;

  return (
    <div className="max-w-md">
      <form onSubmit={onSubmit}>
        <div className="space-y-5">
          {signUp && (
            <Field id={`${id}-name`} label="Full name">
              <input
                id={`${id}-name`}
                name="name"
                type="text"
                required
                maxLength={100}
                autoComplete="name"
                className={inputClass}
              />
            </Field>
          )}
          <Field id={`${id}-email`} label="Email address">
            <input
              id={`${id}-email`}
              name="email"
              type="email"
              required
              autoComplete="email"
              className={inputClass}
            />
          </Field>
          <Field
            id={`${id}-password`}
            label="Password"
            hint={signUp ? `At least ${MIN_PASSWORD_LENGTH} characters.` : undefined}
          >
            <input
              id={`${id}-password`}
              name="password"
              type="password"
              required
              minLength={signUp ? MIN_PASSWORD_LENGTH : undefined}
              maxLength={128}
              autoComplete={signUp ? "new-password" : "current-password"}
              aria-describedby={signUp ? `${id}-password-hint` : undefined}
              className={inputClass}
            />
          </Field>
        </div>

        <div aria-live="polite" className="type-small mt-4 min-h-6">
          {error && (
            <p className="text-sale">
              {error}
            </p>
          )}
        </div>

        <button type="submit" className="btn btn-primary mt-2 w-full" disabled={pending}>
          {pending ? (signUp ? "Creating account…" : "Signing in…") : signUp ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="type-small mt-8 text-ink-muted">
        {signUp ? "Already have an account? " : "New to Atelier? "}
        <Link href={otherHref} className="link text-ink">
          {signUp ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </div>
  );
}

const inputClass =
  "type-body min-h-12 w-full border border-line-strong bg-canvas px-4 placeholder:text-ink-subtle";

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="type-label mb-2 block">
        {label}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="type-small mt-2 text-ink-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
