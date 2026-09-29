import type { Metadata } from "next";
import { ProductListing } from "@/components/product-listing";
import { getProductsBySlugs } from "@/db/queries/products";
import type { Collection } from "@/lib/catalog";

/* Listing page for a curated collection or department (src/lib/catalog.ts). */
export async function CollectionListing({
  collection,
  eyebrow,
}: {
  collection: Collection;
  eyebrow: string;
}) {
  const products = await getProductsBySlugs(collection.productSlugs);

  return (
    <ProductListing
      eyebrow={eyebrow}
      title={collection.name}
      intro={collection.description}
      products={products}
    />
  );
}

export function collectionMetadata(collection: Collection): Metadata {
  return {
    title: collection.name,
    description: collection.description,
    openGraph: {
      title: collection.name,
      description: collection.description,
      images: [{ url: collection.image.src, alt: collection.image.alt }],
    },
  };
}
