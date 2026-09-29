/*
 * The shopping bag's client-safe types and pure helpers. The bag lives in a
 * cookie that holds references only (product id, size, quantity): prices,
 * names and stock always come from the database, so the cookie is untrusted
 * input and is parsed defensively.
 */

export type BagLine = { productId: string; size: string; quantity: number };

export const BAG_COOKIE = "atelier_bag";
/* Keeps the cookie well under the 4 KB browser limit. */
export const MAX_LINES = 30;
/* Upper bound for a requested quantity, before stock is considered. */
export const MAX_QUANTITY = 99;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_SIZE_LENGTH = 32;

export const isProductId = (value: unknown): value is string =>
  typeof value === "string" && UUID.test(value);

export const isSize = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0 && value.length <= MAX_SIZE_LENGTH;

export const isQuantity = (value: unknown): value is number =>
  Number.isInteger(value) && (value as number) >= 1 && (value as number) <= MAX_QUANTITY;

const sameLine = (line: BagLine, productId: string, size: string) =>
  line.productId === productId && line.size === size;

/*
 * The bag stored in the cookie value. Never throws: malformed entries are
 * dropped, duplicates keep the first, and the list is capped at MAX_LINES.
 */
export function parseBag(raw: string | undefined): BagLine[] {
  if (!raw) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];

  const lines: BagLine[] = [];
  for (const entry of data) {
    if (!Array.isArray(entry) || entry.length !== 3) continue;
    const [productId, size, quantity] = entry;
    if (!isProductId(productId) || !isSize(size) || !isQuantity(quantity)) continue;
    if (lines.some((line) => sameLine(line, productId, size))) continue;
    lines.push({ productId, size, quantity });
    if (lines.length === MAX_LINES) break;
  }
  return lines;
}

export const serializeBag = (lines: BagLine[]) =>
  JSON.stringify(lines.map((line) => [line.productId, line.size, line.quantity]));

export const bagCount = (lines: BagLine[]) =>
  lines.reduce((total, line) => total + line.quantity, 0);

export const findLine = (lines: BagLine[], productId: string, size: string) =>
  lines.find((line) => sameLine(line, productId, size));

/* Sets a line's quantity, adding the line at the end if it is new. */
export function setLine(lines: BagLine[], productId: string, size: string, quantity: number) {
  return findLine(lines, productId, size)
    ? lines.map((line) => (sameLine(line, productId, size) ? { ...line, quantity } : line))
    : [...lines, { productId, size, quantity }];
}

export const removeLine = (lines: BagLine[], productId: string, size: string) =>
  lines.filter((line) => !sameLine(line, productId, size));

/* The quantity to keep when `desired` is asked for and `available` are in stock. */
export const clampQuantity = (desired: number, available: number) =>
  Math.max(0, Math.min(desired, available));

/* Sums in integer cents so there is no floating-point drift. */
export const subtotalCents = (lines: { unitPriceCents: number; quantity: number }[]) =>
  lines.reduce((total, line) => total + line.unitPriceCents * line.quantity, 0);

/* Fired on window after the bag cookie changes, so the header count updates. */
export const BAG_CHANGE_EVENT = "bag:change";

export type BagActionResult =
  | { ok: true; quantity: number; available: number; clamped: boolean }
  | { ok: false; reason: BagErrorReason };

export type BagErrorReason = "invalid" | "unavailable" | "sold-out" | "bag-full";

export const bagErrorMessage: Record<BagErrorReason, string> = {
  invalid: "Something went wrong. Please refresh the page and try again.",
  unavailable: "This piece is no longer available.",
  "sold-out": "Sorry, this size has just sold out.",
  "bag-full": `Your bag is full (${MAX_LINES} pieces). Remove something to add more.`,
};
