/*
 * Reads and writes the bag cookie. Reading works anywhere on the server;
 * writing only in Server Actions and Route Handlers.
 */
import "server-only";
import { cookies } from "next/headers";
import { BAG_COOKIE, parseBag, serializeBag, type BagLine } from "@/lib/cart";

export async function readBag() {
  return parseBag((await cookies()).get(BAG_COOKIE)?.value);
}

export async function writeBag(lines: BagLine[]) {
  const store = await cookies();
  if (lines.length === 0) {
    store.delete(BAG_COOKIE);
    return;
  }
  store.set(BAG_COOKIE, serializeBag(lines), {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    // Readable by the header's item count. It holds no prices or personal
    // data, and the server re-checks every line against the database.
    httpOnly: false,
  });
}
