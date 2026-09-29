import type { Metadata } from "next";
import { ProductListing } from "@/components/product-listing";
import { getNewArrivals } from "@/db/queries/products";

// Products come from the database; regenerate the page at most every 5 minutes.
export const revalidate = 300;

const NEW_ARRIVALS_LIMIT = 20;

const description =
  "The latest ready-to-wear, bags, shoes and accessories, just landed at Atelier.";

export const metadata: Metadata = {
  title: "New arrivals",
  description,
  openGraph: { title: "New arrivals", description },
};

export default async function NewInPage() {
  const products = await getNewArrivals(NEW_ARRIVALS_LIMIT);

  return (
    <ProductListing
      eyebrow="Just landed"
      title="New arrivals"
      intro="The newest pieces from the house, from tailored outerwear to leather goods, updated as they arrive."
      products={products}
    />
  );
}
