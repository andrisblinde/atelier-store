import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { ListingHeader } from "@/components/product-listing";
import { ActiveFilters, FilterFields, Pagination } from "@/components/shop/category-filters";
import { FilterForm, SortSelect } from "@/components/shop/filter-form";
import {
  getCategoryBySlug,
  getCategoryFacets,
  getCategoryProducts,
} from "@/db/queries/products";
import { categoryIntros } from "@/lib/catalog";
import {
  filtersHref,
  filtersToSearchParams,
  hasActiveFilters,
  PAGE_SIZE,
  parseShopFilters,
} from "@/lib/shop-filters";

// Filters and sorting come from the URL, so this page renders per request.
// The product query is paginated and filtered in SQL, never in the browser.

const FORM_ID = "category-filters";

export async function generateMetadata({
  params,
  searchParams,
}: PageProps<"/[category]">): Promise<Metadata> {
  const slug = (await params).category;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};

  const description =
    categoryIntros[category.slug] ??
    `Shop ${category.name.toLowerCase()} at Atelier, with complimentary shipping and returns.`;
  const filtered = hasActiveFilters(parseShopFilters(await searchParams));

  return {
    title: category.name,
    description,
    openGraph: { title: category.name, description },
    alternates: { canonical: `/${category.slug}` },
    // Filtered and sorted variants are for people, not search results.
    ...(filtered && { robots: { index: false, follow: true } }),
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/[category]">) {
  const category = await getCategoryBySlug((await params).category);
  if (!category) notFound();

  const filters = parseShopFilters(await searchParams);
  const pathname = `/${category.slug}`;
  const [facets, { products, total }] = await Promise.all([
    getCategoryFacets(category.id),
    getCategoryProducts(category.id, filters),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  // A stale or hand-edited ?page= past the end goes to the last real page.
  if (filters.page > totalPages) redirect(filtersHref(pathname, { ...filters, page: totalPages }));
  const filtered = hasActiveFilters(filters);
  // Remount the fields whenever the URL changes so they always mirror it.
  const stateKey = filtersToSearchParams({ ...filters, page: 1 }).toString();

  return (
    <main id="main">
      <ListingHeader
        eyebrow="Shop by category"
        title={category.name}
        intro={
          categoryIntros[category.slug] ??
          `Shop ${category.name.toLowerCase()} from the collection, newest first.`
        }
        parent={{ label: "Shop", href: "/shop" }}
      />

      <div className="container-page pb-section lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start lg:gap-x-gutter xl:grid-cols-[17rem_minmax(0,1fr)]">
        <aside aria-label="Filters" className="mb-6 lg:sticky lg:top-[calc(var(--spacing-header)+1.5rem)] lg:mb-0">
          <FilterForm id={FORM_ID} action={pathname}>
            <FilterFields key={stateKey} facets={facets} filters={filters} />
          </FilterForm>
        </aside>

        <section aria-labelledby="products-title">
          <h2 id="products-title" className="sr-only">
            Products
          </h2>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-y py-3 md:mb-8">
            <p className="type-label text-ink-muted" aria-live="polite">
              {total} {total === 1 ? "piece" : "pieces"}
              {totalPages > 1 && ` · page ${filters.page} of ${totalPages}`}
            </p>
            <SortSelect key={filters.sort} form={FORM_ID} value={filters.sort} />
          </div>

          <ActiveFilters
            pathname={pathname}
            filters={filters}
            categoryNames={new Map(facets.categories.map((option) => [option.slug, option.name]))}
          />

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
              <p className="type-h3">
                {filtered ? "No pieces match these filters" : "Nothing here just yet"}
              </p>
              <p className="type-body mt-3 text-ink-muted">
                {filtered
                  ? "Try removing a filter or widening the price range."
                  : "New pieces arrive every week. Check back soon."}
              </p>
              <Link href={filtered ? pathname : "/shop"} className="btn btn-secondary mt-8">
                {filtered ? "Clear filters" : "Back to shop"}
              </Link>
            </div>
          )}

          <Pagination
            page={filters.page}
            totalPages={totalPages}
            href={(page) => filtersHref(pathname, { ...filters, page })}
          />
        </section>
      </div>
    </main>
  );
}
