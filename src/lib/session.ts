/*
 * Server-side session access for pages, layouts and server-only data
 * functions. Call these in every protected page (and in admin data access),
 * not only in a layout: layouts do not re-run on client navigation.
 */
import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/* The current session or null. Cached so one request hits the database once. */
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

export async function requireUser(returnTo: string) {
  const session = await getSession();
  if (!session) redirect(`/sign-in?next=${encodeURIComponent(returnTo)}`);
  return session;
}

/* Non-admins get a 404 so the admin area is not advertised. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/sign-in?next=/admin");
  if (session.user.role !== "admin") notFound();
  return session;
}

/*
 * A post-sign-in destination that can only point back into this site: a path
 * starting with a single "/". Rejects "//host" and "/\host" (other origins to a
 * browser) and any whitespace or backslash, since browsers strip tabs and
 * newlines ("/\t/host" becomes "//host"). Anything else falls back.
 */
const SAME_SITE_PATH = /^\/(?!\/)[^\s\\]*$/;

export function safeNext(next: string | string[] | undefined, fallback = "/account") {
  const value = Array.isArray(next) ? next[0] : next;
  return value && SAME_SITE_PATH.test(value) ? value : fallback;
}
