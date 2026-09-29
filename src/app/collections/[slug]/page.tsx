import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionListing, collectionMetadata } from "@/components/collection-listing";
import { allCollections, getCollection } from "@/lib/catalog";

// Collections are editorial and listed in code, so unknown slugs are a 404.
// Their products come from the database; regenerate at most every 5 minutes.
export const revalidate = 300;
export const dynamicParams = false;

export function generateStaticParams() {
  return allCollections.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const collection = getCollection((await params).slug);
  return collection ? collectionMetadata(collection) : {};
}

export default async function CollectionPage({ params }: PageProps<"/collections/[slug]">) {
  const collection = getCollection((await params).slug);
  if (!collection) notFound();

  return <CollectionListing collection={collection} eyebrow="Collection" />;
}
