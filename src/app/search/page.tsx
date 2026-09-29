import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SearchIcon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { ListingHeader } from "@/components/product-listing";
import { Pagination } from "@/components/shop/category-filters";
import { SortSelect } from "@/components/shop/filter-form";
import { getShopCategories, searchProducts } from "@/db/queries/products";
import { parseSearchParams, SEARCH_SORT_OPTIONS, searchHref } from "@/lib/search";
import { PAGE_SIZE } from "@/lib/shop-filters";

// Results depend on the query string, so this page renders per request.
// Matching, sorting and paging run in SQL (searchProducts).

const FORM_ID = "product-search";

export async function generateMetadata({ searchParams }: PageProps<"/search">): Promise<Metadata> {
  const { query } = parseSearchParams(await searchParams);
  return {
    title: query ? `Search: ${query}` : "Search",
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const state = parseSearchParams(await searchParams);
  const { query, sort, page } = state;
  const [{ products, total }, categories] = await Promise.all([
    searchProducts(state),
    getShopCategories(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (page > totalPages) redirect(searchHref({ query, sort, page: totalPages }));

  const suggestions = categories.filter((category) => category.productCount > 0);

  return (
    <main id="main">
      <ListingHeader
        eyebrow="The catalogue"
        title="Search"
        intro="Search by name, colour, material or category, for example “black boots” or “cashmere”."
      />

      <div className="container-page pb-section">
        <Form id={FORM_ID} action="/search" role="search" className="flex max-w-2xl gap-2">
          <label htmlFor="search-query" className="sr-only">
            Search products
          </label>
          <input
            id="search-query"
            // Remount when the URL changes so the field always shows the current query.
            key={query}
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search products"
            autoComplete="off"
            enterKeyHint="search"
            maxLength={100}
            autoFocus={!query}
            className="type-body min-h-12 min-w-0 flex-1 border border-line-strong bg-canvas px-4 placeholder:text-ink-subtle"
          />
          <button type="submit" className="btn btn-primary">
            <SearchIcon width={18} height={18} aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Search</span>
          </button>
        </Form>

        {query ? (
          <section aria-labelledby="results-title" className="mt-10 md:mt-12">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-y py-3 md:mb-8">
              <h2 id="results-title" className="type-label text-ink-muted" aria-live="polite">
                {total} {total === 1 ? "result" : "results"} for “{query}”
                {totalPages > 1 && ` · page ${page} of ${totalPages}`}
              </h2>
              {total > 1 && (
                <SortSelect key={sort} form={FORM_ID} value={sort} options={SEARCH_SORT_OPTIONS} />
              )}
            </div>

            {products.length > 0 ? (
              <ul className="product-grid">
                {products.map((product) => (
                  <li key={product.slug}>
                    <ProductCard product={product} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-section text-center">
                <p className="type-h3">No pieces match “{query}”</p>
                <p className="type-body mt-3 text-ink-muted">
                  Check the spelling, try fewer words, or browse a category below.
                </p>
                <Link href="/shop" className="btn btn-secondary mt-8">
                  Browse the shop
                </Link>
              </div>
            )}

            <Pagination
              page={page}
              totalPages={totalPages}
              href={(target) => searchHref({ query, sort, page: target })}
            />
          </section>
        ) : null}

        {(!query || products.length === 0) && suggestions.length > 0 && (
          <nav aria-labelledby="browse-title" className="mt-10 md:mt-12">
            <h2 id="browse-title" className="type-label mb-4 text-ink-muted">
              Or browse
            </h2>
            <ul className="flex flex-wrap gap-2">
              {suggestions.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/${category.slug}`}
                    className="type-small inline-flex min-h-10 items-center border px-4 hover:border-line-strong"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </main>
  );
}
