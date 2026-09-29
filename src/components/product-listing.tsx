import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/product";

type ListingHeaderProps = {
  eyebrow: string;
  title: string;
  intro: string;
  /* Crumb between Home and the current page, e.g. Shop. */
  parent?: { label: string; href: string };
};

/* Breadcrumb and page heading shared by listing pages. */
export function ListingHeader({ eyebrow, title, intro, parent }: ListingHeaderProps) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="container-page py-4 lg:py-6">
        <ol className="type-label flex flex-wrap items-center gap-2 text-ink-muted">
          <li>
            <Link href="/" className="link-quiet hover:text-ink">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          {parent && (
            <>
              <li>
                <Link href={parent.href} className="link-quiet hover:text-ink">
                  {parent.label}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
            </>
          )}
          <li aria-current="page" className="text-ink">
            {title}
          </li>
        </ol>
      </nav>

      <div className="container-page pt-6 pb-8 md:pt-10 md:pb-12">
        <p className="type-label mb-3 text-ink-muted">{eyebrow}</p>
        <h1 className="type-h1">{title}</h1>
        <p className="type-body mt-4 max-w-prose-narrow text-ink-muted">{intro}</p>
      </div>
    </>
  );
}

type ProductListingProps = Omit<ListingHeaderProps, "parent"> & { products: Product[] };

/* Full-page listing of a fixed set of products: heading, count and grid. */
export function ProductListing({ products, ...header }: ProductListingProps) {
  return (
    <main id="main">
      <ListingHeader {...header} />

      <section aria-labelledby="products-title" className="container-page pb-section">
        <h2 id="products-title" className="sr-only">
          Products
        </h2>
        <p className="type-label mb-6 border-y py-4 text-ink-muted md:mb-8">
          {products.length} {products.length === 1 ? "piece" : "pieces"}
        </p>

        {products.length > 0 ? (
          <ul className="product-grid">
            {products.map((product) => (
              <li key={product.slug}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="container-prose py-section text-center">
            <p className="type-h3">Nothing here just yet</p>
            <p className="type-body mt-3 text-ink-muted">
              New pieces arrive every week. Check back soon.
            </p>
            <Link href="/" className="btn btn-secondary mt-8">
              Return home
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
