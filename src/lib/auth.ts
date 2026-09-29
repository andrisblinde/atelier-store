import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";

/*
 * Server-only auth instance. BETTER_AUTH_SECRET and BETTER_AUTH_URL come from
 * the environment. Pages read the session through src/lib/session.ts.
 */
export const auth = betterAuth({
  appName: "Atelier",
  // The Neon HTTP driver has no interactive transactions; the adapter's
  // `transaction` option stays at its default (false) for Postgres.
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
    autoSignIn: true,
  },
  session: {
    // Sliding 30-day sessions, extended at most once a day while in use. No
    // cookie cache, so sign-outs and role changes apply on the next request.
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  user: {
    additionalFields: {
      // "customer" | "admin". input: false means no client request (sign-up
      // or update) can set it; change it with `npm run auth:set-role`.
      role: { type: "string", required: false, defaultValue: "customer", input: false },
    },
  },
  rateLimit: {
    // On in every environment; the database store is shared across
    // serverless instances, unlike the in-memory default.
    enabled: true,
    storage: "database",
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 3 },
    },
  },
  // nextCookies must stay last so it can set cookies from server actions.
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
