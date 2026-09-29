import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Price } from "@/components/price";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductInfo } from "@/components/product/product-info";
import { ProductPurchase } from "@/components/product/product-purchase";
import { StockStatus } from "@/components/product/stock-status";
import { SectionHeading } from "@/components/section-heading";
import { getProductBySlug, getProductSlugs, getRelatedProducts } from "@/db/queries/products";
import { isOneSize, productStock, type Product, type StockState } from "@/lib/product";

// Products known at build time are prerendered; ones added later render on
// first request. Pages regenerate at most every 5 minutes to pick up price
// and stock changes.
export const revalidate = 300;

export async function generateStaticParams() {
  return getProductSlugs();
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.images[0].src, alt: product.images[0].alt }],
    },
  };
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();

  const stock = productStock(product);
  const related = await getRelatedProducts(product);

  return (
    <main id="main">
      <script
        type="application/ld+json"
        // Escape "<" so product copy can never close the script tag.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd(product, stock)).replace(/</g, "\\u003c"),
        }}
      />

      <nav aria-label="Breadcrumb" className="container-page py-4 lg:py-6">
        <ol className="type-label flex flex-wrap items-center gap-2 text-ink-muted">
          <li>
            <Link href="/" className="link-quiet hover:text-ink">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={`/${product.category.slug}`} className="link-quiet hover:text-ink">
              {product.category.name}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="lg:container-page lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start lg:gap-x-gutter">
        <ProductGallery product={product} />

        <div className="px-gutter pt-8 lg:sticky lg:top-[calc(var(--spacing-header)+2rem)] lg:px-0 lg:pt-0 xl:pl-[4vw]">
          <div className="max-w-xl lg:max-w-md">
            <Link
              href={`/${product.category.slug}`}
              className="type-label link-quiet text-ink-muted"
            >
              {product.category.name}
            </Link>
            <h1 className="type-h1 mt-3">{product.name}</h1>
            <Price product={product} className="type-body mt-3 tabular-nums" />
            <StockStatus state={stock} className="mt-4" />

            <hr className="divider my-6" />

            <p className="type-small mb-6">
              <span className="type-label">Colour</span>
              <span className="text-ink-muted">: {product.colour}</span>
              {isOneSize(product) && (
                <>
                  <span className="mx-3 text-line" aria-hidden="true">|</span>
                  <span className="type-label">Size</span>
                  <span className="text-ink-muted">: One size</span>
                </>
              )}
            </p>

            <ProductPurchase sizes={product.sizes} oneSize={isOneSize(product)} />

            <ul className="type-small mt-8 mb-10 space-y-1.5 text-ink-muted">
              <li>Complimentary express shipping</li>
              <li>Free returns within 30 days</li>
              <li>Signature Atelier gift packaging</li>
            </ul>

            <ProductInfo
              sections={[
                {
                  title: "Description",
                  open: true,
                  content: <p>{product.description}</p>,
                },
                {
                  title: "Details & care",
                  content: (
                    <ul className="list-disc space-y-1 pl-4">
                      {product.details.map((detail) => (
                        <li key={detail}>{detail}</li>
                      ))}
                    </ul>
                  ),
                },
                {
                  title: "Shipping & returns",
                  content: (
                    <div className="space-y-3">
                      <p>
                        Complimentary express delivery in 2 to 4 business days. Orders placed
                        before 1pm ship the same day.
                      </p>
                      <p>
                        Return or exchange unworn items within 30 days. We&rsquo;ll arrange a
                        free collection from your door.{" "}
                        <Link href="/returns" className="link">
                          Read our returns policy
                        </Link>
                        .
                      </p>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </div>

      <section aria-labelledby="related-title" className="container-page section-space">
        <SectionHeading id="related-title" eyebrow="Complete the look" title="You may also like" />
        <ul className="grid grid-cols-2 gap-x-grid-x gap-y-grid-y lg:grid-cols-4">
          {related.map((item) => (
            <li key={item.slug}>
              <ProductCard product={item} />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

const availability: Record<StockState["status"], string> = {
  "in-stock": "https://schema.org/InStock",
  "low-stock": "https://schema.org/LimitedAvailability",
  "out-of-stock": "https://schema.org/OutOfStock",
};

function productJsonLd(product: Product, stock: StockState) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    category: product.category.name,
    color: product.colour,
    image: product.images.map((image) => image.src),
    brand: { "@type": "Brand", name: "Atelier" },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "USD",
      availability: availability[stock.status],
    },
  };
}
