import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ListingHeader } from "@/components/product-listing";
import { getShopCategories } from "@/db/queries/products";

// Categories and counts come from the database; regenerate at most every 5 minutes.
export const revalidate = 300;

const description =
  "Browse the Atelier catalogue by department or category: ready-to-wear, outerwear, knitwear, shoes, bags and jewellery.";

export const metadata: Metadata = {
  title: "Shop",
  description,
  openGraph: { title: "Shop", description },
};

type Tile = Awaited<ReturnType<typeof getShopCategories>>[number];

export default async function ShopPage() {
  const categories = (await getShopCategories()).filter((category) => category.productCount > 0);
  const departments = categories.filter((category) => !category.isProductType);
  const productTypes = categories.filter((category) => category.isProductType);

  return (
    <main id="main">
      <ListingHeader
        eyebrow="The catalogue"
        title="Shop"
        intro="Start with a department or a category, then refine by size, colour and price."
      />

      {departments.length > 0 && (
        <TileSection id="departments-title" title="Shop by department">
          <ul className="grid grid-cols-2 gap-x-grid-x gap-y-8">
            {departments.map((tile) => (
              <li key={tile.slug}>
                <CategoryTile tile={tile} large />
              </li>
            ))}
          </ul>
        </TileSection>
      )}

      <TileSection id="categories-title" title="Shop by category">
        <ul className="grid grid-cols-2 gap-x-grid-x gap-y-8 md:grid-cols-4 xl:grid-cols-7">
          {productTypes.map((tile) => (
            <li key={tile.slug}>
              <CategoryTile tile={tile} />
            </li>
          ))}
        </ul>
      </TileSection>
    </main>
  );
}

function TileSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="container-page pb-section">
      <h2 id={id} className="type-label mb-6 border-t pt-6 text-ink-muted md:mb-8">
        {title}
      </h2>
      {children}
    </section>
  );
}

function CategoryTile({ tile, large = false }: { tile: Tile; large?: boolean }) {
  return (
    <Link href={`/${tile.slug}`} className="group block">
      <div className={`media-frame ${large ? "aspect-product sm:aspect-hero" : ""}`}>
        {tile.image && (
          <Image
            src={tile.image.src}
            alt=""
            fill
            sizes={
              large
                ? "50vw"
                : "(min-width: 80rem) 14vw, (min-width: 48rem) 25vw, 50vw"
            }
            className={`transition-transform duration-700 group-hover:scale-[1.03] ${large ? "object-top" : ""}`}
          />
        )}
      </div>
      <p
        className={`link-quiet mt-4 group-hover:decoration-current ${large ? "type-h2" : "type-label"}`}
      >
        {tile.name}
      </p>
      <p className="type-small mt-1 text-ink-muted">
        {tile.productCount} {tile.productCount === 1 ? "piece" : "pieces"}
      </p>
    </Link>
  );
}
