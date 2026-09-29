import type { ReactNode } from "react";
import Link from "next/link";
import type { CategoryFacets } from "@/db/queries/products";
import { formatPrice } from "@/lib/product";
import { filtersHref, type ShopFilters } from "@/lib/shop-filters";

/* Filter fields for FilterForm. Groups with a single option are hidden unless in use. */
export function FilterFields({ facets, filters }: { facets: CategoryFacets; filters: ShopFilters }) {
  const show = (optionCount: number, selected: number) => optionCount > 1 || selected > 0;

  return (
    <div className="border-t">
      {show(facets.categories.length, filters.categories.length) && (
        <FilterGroup title={facets.isProductType ? "Department" : "Product type"}>
          {facets.categories.map((option) => (
            <CheckboxOption
              key={option.slug}
              name="category"
              value={option.slug}
              label={option.name}
              count={option.count}
              checked={filters.categories.includes(option.slug)}
            />
          ))}
        </FilterGroup>
      )}

      {show(facets.sizes.length, filters.sizes.length) && (
        <FilterGroup title="Size">
          <div className="grid grid-cols-3 gap-2">
            {facets.sizes.map((size) => (
              <label
                key={size}
                className="type-small relative flex min-h-10 cursor-pointer items-center justify-center border px-1 text-center transition-colors hover:border-line-strong has-checked:border-line-strong has-checked:bg-ink has-checked:text-canvas has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink"
              >
                <input
                  type="checkbox"
                  name="size"
                  value={size}
                  defaultChecked={filters.sizes.includes(size)}
                  className="sr-only"
                />
                {size}
              </label>
            ))}
          </div>
          <p className="type-small mt-3 text-ink-muted">Shows pieces in stock in these sizes.</p>
        </FilterGroup>
      )}

      {show(facets.colours.length, filters.colours.length) && (
        <FilterGroup title="Colour">
          {facets.colours.map((option) => (
            <CheckboxOption
              key={option.value}
              name="colour"
              value={option.value}
              label={option.value}
              count={option.count}
              checked={filters.colours.includes(option.value)}
            />
          ))}
        </FilterGroup>
      )}

      {facets.price && (facets.price.min < facets.price.max || filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
        <FilterGroup title="Price">
          <div className="flex items-end gap-2">
            <PriceField name="min" label="Min" placeholder={facets.price.min} value={filters.minPrice} />
            <span aria-hidden="true" className="pb-3 text-ink-muted">
              –
            </span>
            <PriceField name="max" label="Max" placeholder={facets.price.max} value={filters.maxPrice} />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm mt-3 w-full">
            Apply price
          </button>
        </FilterGroup>
      )}

      <FilterGroup title="Availability">
        <CheckboxOption name="stock" value="in" label="In stock only" checked={filters.inStock} />
      </FilterGroup>

      {/* Without JavaScript nothing applies on change, so offer an explicit submit. */}
      <noscript>
        <button type="submit" className="btn btn-primary mt-6 w-full">
          Apply filters
        </button>
      </noscript>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details open className="group border-b">
      <summary className="type-label flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
        {title}
        <span
          aria-hidden="true"
          className="text-base font-light transition-transform group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <fieldset className="pb-5">
        <legend className="sr-only">{title}</legend>
        <div className="space-y-2">{children}</div>
      </fieldset>
    </details>
  );
}

function CheckboxOption({
  name,
  value,
  label,
  count,
  checked,
}: {
  name: string;
  value: string;
  label: string;
  count?: number;
  checked: boolean;
}) {
  return (
    <label className="type-small flex cursor-pointer items-center gap-3">
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={checked}
        className="size-4 shrink-0 accent-ink"
      />
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="text-ink-muted tabular-nums">{count}</span>}
    </label>
  );
}

function PriceField({
  name,
  label,
  placeholder,
  value,
}: {
  name: string;
  label: string;
  placeholder: number;
  value?: number;
}) {
  return (
    <label className="flex-1">
      <span className="type-label mb-1 block text-ink-muted">{label}</span>
      <input
        type="number"
        name={name}
        min={0}
        step={1}
        inputMode="numeric"
        placeholder={formatPrice(placeholder)}
        defaultValue={value}
        className="type-small min-h-10 w-full border border-line-strong bg-canvas px-3 placeholder:text-ink-subtle"
      />
    </label>
  );
}

/* Removable chips for the filters in use, each a link to the URL without it. */
export function ActiveFilters({
  pathname,
  filters,
  categoryNames,
}: {
  pathname: string;
  filters: ShopFilters;
  categoryNames: Map<string, string>;
}) {
  const base = { ...filters, page: 1 };
  const chips: { label: string; href: string }[] = [
    ...filters.categories.map((slug) => ({
      label: categoryNames.get(slug) ?? slug,
      href: filtersHref(pathname, { ...base, categories: base.categories.filter((c) => c !== slug) }),
    })),
    ...filters.sizes.map((size) => ({
      label: `Size ${size}`,
      href: filtersHref(pathname, { ...base, sizes: base.sizes.filter((s) => s !== size) }),
    })),
    ...filters.colours.map((colour) => ({
      label: colour,
      href: filtersHref(pathname, { ...base, colours: base.colours.filter((c) => c !== colour) }),
    })),
    ...(filters.minPrice !== undefined
      ? [{ label: `From ${formatPrice(filters.minPrice)}`, href: filtersHref(pathname, { ...base, minPrice: undefined }) }]
      : []),
    ...(filters.maxPrice !== undefined
      ? [{ label: `Up to ${formatPrice(filters.maxPrice)}`, href: filtersHref(pathname, { ...base, maxPrice: undefined }) }]
      : []),
    ...(filters.inStock
      ? [{ label: "In stock only", href: filtersHref(pathname, { ...base, inStock: false }) }]
      : []),
  ];
  if (chips.length === 0) return null;

  const cleared = filtersHref(pathname, {
    ...base,
    categories: [],
    sizes: [],
    colours: [],
    minPrice: undefined,
    maxPrice: undefined,
    inStock: false,
  });

  return (
    <ul aria-label="Active filters" className="mb-6 flex flex-wrap items-center gap-2 md:mb-8">
      {chips.map((chip) => (
        <li key={chip.href + chip.label}>
          <Link
            href={chip.href}
            scroll={false}
            className="type-small inline-flex min-h-9 items-center gap-2 border px-3 hover:border-line-strong"
          >
            {chip.label}
            <span aria-hidden="true">×</span>
            <span className="sr-only">(remove filter)</span>
          </Link>
        </li>
      ))}
      <li>
        <Link href={cleared} scroll={false} className="type-small link ml-2 text-ink-muted">
          Clear all
        </Link>
      </li>
    </ul>
  );
}

/* Numbered pages with first/last and the current page's neighbours. */
export function Pagination({
  page: current,
  totalPages,
  href,
}: {
  page: number;
  totalPages: number;
  href: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | "gap")[] = [];
  for (let page = 1; page <= totalPages; page++) {
    if (page === 1 || page === totalPages || Math.abs(page - current) <= 1) pages.push(page);
    else if (pages.at(-1) !== "gap") pages.push("gap");
  }

  const cell = "type-small inline-flex min-h-10 min-w-10 items-center justify-center border px-3";

  return (
    <nav aria-label="Pagination" className="mt-12 flex flex-wrap items-center justify-center gap-2">
      {current > 1 && (
        <Link href={href(current - 1)} className={`${cell} hover:border-line-strong`} rel="prev">
          Previous
        </Link>
      )}
      {pages.map((page, i) =>
        page === "gap" ? (
          <span key={`gap-${i}`} aria-hidden="true" className="px-1 text-ink-muted">
            …
          </span>
        ) : (
          <Link
            key={page}
            href={href(page)}
            aria-current={page === current ? "page" : undefined}
            className={`${cell} ${page === current ? "border-line-strong bg-ink text-canvas" : "hover:border-line-strong"}`}
          >
            <span className="sr-only">Page </span>
            {page}
          </Link>
        ),
      )}
      {current < totalPages && (
        <Link href={href(current + 1)} className={`${cell} hover:border-line-strong`} rel="next">
          Next
        </Link>
      )}
    </nav>
  );
}
