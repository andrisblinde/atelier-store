/*
 * Sets a user's role. The only way to grant admin: no page or API endpoint can.
 * Run with `npm run auth:set-role -- <email> <admin|customer>`.
 * Takes effect on the user's next request (sessions are not cookie-cached).
 */
import { eq } from "drizzle-orm";
import { db } from "./index";
import { user } from "./schema";

const ROLES = ["admin", "customer"] as const;

async function main() {
  const [email, role] = process.argv.slice(2);
  if (!email || !ROLES.includes(role as (typeof ROLES)[number])) {
    console.error("Usage: npm run auth:set-role -- <email> <admin|customer>");
    process.exit(1);
  }

  const updated = await db
    .update(user)
    .set({ role })
    .where(eq(user.email, email.trim().toLowerCase()))
    .returning({ email: user.email, role: user.role });

  if (updated.length === 0) {
    console.error(`No user with email ${email}.`);
    process.exit(1);
  }
  console.log(`${updated[0].email} is now ${updated[0].role}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
