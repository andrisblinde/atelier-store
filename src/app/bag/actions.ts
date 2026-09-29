"use server";

/*
 * Bag mutations. Arguments come straight from the client, so each one is
 * validated before touching the database, and every quantity is clamped to
 * live stock. No sign-in is needed: the bag belongs to the browser.
 */
import { refresh } from "next/cache";
import { getStockQuantity } from "@/db/queries/cart";
import { readBag, writeBag } from "@/lib/bag-cookie";
import {
  clampQuantity,
  findLine,
  isProductId,
  isQuantity,
  isSize,
  MAX_LINES,
  removeLine,
  setLine,
  type BagActionResult,
} from "@/lib/cart";

export async function addToBag(
  productId: unknown,
  size: unknown,
  quantity: unknown = 1,
): Promise<BagActionResult> {
  if (!isProductId(productId) || !isSize(size) || !isQuantity(quantity)) {
    return { ok: false, reason: "invalid" };
  }

  const lines = await readBag();
  const existing = findLine(lines, productId, size);
  if (!existing && lines.length >= MAX_LINES) return { ok: false, reason: "bag-full" };

  const available = await getStockQuantity(productId, size);
  if (available === undefined) return { ok: false, reason: "unavailable" };
  if (available <= 0) return { ok: false, reason: "sold-out" };

  const desired = (existing?.quantity ?? 0) + quantity;
  const final = clampQuantity(desired, available);
  await writeBag(setLine(lines, productId, size, final));
  return { ok: true, quantity: final, available, clamped: final < desired };
}

/* Sets a line's quantity; 0 removes it. */
export async function updateBagLine(
  productId: unknown,
  size: unknown,
  quantity: unknown,
): Promise<BagActionResult> {
  if (quantity === 0) return removeBagLine(productId, size);
  if (!isProductId(productId) || !isSize(size) || !isQuantity(quantity)) {
    return { ok: false, reason: "invalid" };
  }

  const lines = await readBag();
  if (!findLine(lines, productId, size)) return { ok: false, reason: "unavailable" };

  const available = await getStockQuantity(productId, size);
  if (available === undefined || available <= 0) {
    refresh();
    return { ok: false, reason: available === undefined ? "unavailable" : "sold-out" };
  }

  const final = clampQuantity(quantity, available);
  await writeBag(setLine(lines, productId, size, final));
  refresh();
  return { ok: true, quantity: final, available, clamped: final < quantity };
}

export async function removeBagLine(productId: unknown, size: unknown): Promise<BagActionResult> {
  if (!isProductId(productId) || !isSize(size)) return { ok: false, reason: "invalid" };

  await writeBag(removeLine(await readBag(), productId, size));
  refresh();
  return { ok: true, quantity: 0, available: 0, clamped: false };
}
