/*
 * Server-only access to auth users for the admin area. Every export checks the
 * admin role itself, so it stays protected whichever page calls it.
 */
import "server-only";
import { count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";
import { requireAdmin } from "@/lib/session";

export async function getUserStats() {
  await requireAdmin();
  const [[customers], [admins]] = await db.batch([
    db.select({ total: count() }).from(user).where(eq(user.role, "customer")),
    db.select({ total: count() }).from(user).where(eq(user.role, "admin")),
  ]);
  return { customers: customers?.total ?? 0, admins: admins?.total ?? 0 };
}

export async function getRecentUsers(limit = 10) {
  await requireAdmin();
  return db
    .select({ id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt })
    .from(user)
    .orderBy(desc(user.createdAt))
    .limit(limit);
}
