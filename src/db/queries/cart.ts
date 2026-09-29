/*
 * Server-only bag data. Every read is live (no ISR, no caching): prices and
 * stock in the bag must match the database now, not up to 5 minutes ago.
 */
import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { productStock } from "@/db/schema";
import { clampQuantity, subtotalCents, type BagLine } from "@/lib/cart";
import type { ProductImage } from "@/lib/product";

export type BagLineStatus =
  /* The requested quantity is in stock. */
  | "ok"
  /* Fewer are in stock than were requested; the line shows what is left. */
  | "reduced"
  /* The product or size is gone, or it is sold out. Not in the subtotal. */
  | "unavailable";

export type BagLineView = {
  productId: string;
  size: string;
  /* Undefined when the product no longer exists. */
  product?: {
    slug: string;
    name: string;
    categoryName: string;
    image: ProductImage;
    oneSize: boolean;
    /* Whole currency units. */
    price: number;
    compareAtPrice?: number;
  };
  /* What the cookie asked for. */
  requested: number;
  /* What the bag can hold now: min(requested, available). */
  quantity: number;
  available: number;
  status: BagLineStatus;
  /* Whole currency units. */
  lineTotal: number;
};

export type BagDetails = {
  lines: BagLineView[];
  /* Whole currency units, over available lines only. */
  subtotal: number;
  itemCount: number;
  hasIssues: boolean;
};

/* The bag's lines joined against live product, price and stock data in one query. */
export async function getBagDetails(lines: BagLine[]): Promise<BagDetails> {
  if (lines.length === 0) return { lines: [], subtotal: 0, itemCount: 0, hasIssues: false };

  const ids = [...new Set(lines.map((line) => line.productId))];
  const rows = await db.query.products.findMany({
    columns: { id: true, slug: true, name: true, price: true, compareAtPrice: true, images: true },
    with: {
      stock: { columns: { size: true, quantity: true } },
      productCategories: {
        columns: {},
        where: (membership, { eq }) => eq(membership.isPrimary, true),
        with: { category: { columns: { name: true } } },
      },
    },
    where: (products, { inArray }) => inArray(products.id, ids),
  });
  const byId = new Map(rows.map((row) => [row.id, row]));

  const views = lines.map((line): BagLineView => {
    const row = byId.get(line.productId);
    const available = row?.stock.find((stock) => stock.size === line.size)?.quantity ?? 0;
    const quantity = clampQuantity(line.quantity, available);
    const status: BagLineStatus =
      quantity === 0 ? "unavailable" : quantity < line.quantity ? "reduced" : "ok";
    const unitPriceCents = row?.price ?? 0;

    return {
      productId: line.productId,
      size: line.size,
      product: row && {
        slug: row.slug,
        name: row.name,
        categoryName: row.productCategories[0]?.category.name ?? "",
        image: row.images[0] ?? { src: "", alt: "" },
        oneSize: row.stock.length === 1 && row.stock[0]?.size === "One size",
        price: row.price / 100,
        compareAtPrice: row.compareAtPrice === null ? undefined : row.compareAtPrice / 100,
      },
      requested: line.quantity,
      quantity,
      available,
      status,
      lineTotal: (unitPriceCents * quantity) / 100,
    };
  });

  return {
    lines: views,
    // Unit prices in cents from the rows, not the rounded view values.
    subtotal:
      subtotalCents(
        views.map((view) => ({
          unitPriceCents: byId.get(view.productId)?.price ?? 0,
          quantity: view.quantity,
        })),
      ) / 100,
    itemCount: views.reduce((total, view) => total + view.quantity, 0),
    hasIssues: views.some((view) => view.status !== "ok"),
  };
}

/* Live quantity on hand for one size, or undefined if the product or size does not exist. */
export async function getStockQuantity(productId: string, size: string) {
  const [row] = await db
    .select({ quantity: productStock.quantity })
    .from(productStock)
    .where(and(eq(productStock.productId, productId), eq(productStock.size, size)))
    .limit(1);
  return row?.quantity;
}
