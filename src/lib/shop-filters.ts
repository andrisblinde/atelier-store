/*
 * Category page filters and sorting, read from and written to URL search
 * params so filtered pages can be refreshed and shared. Client-safe: the
 * server queries live in src/db/queries/products.ts.
 */

export const PAGE_SIZE = 24;

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["value"];

const DEFAULT_SORT: SortKey = "newest";

export type ShopFilters = {
  sizes: string[];
  colours: string[];
  /* Slugs of other categories the product must also belong to (any of). */
  categories: string[];
  /* Whole currency units, inclusive. */
  minPrice?: number;
  maxPrice?: number;
  inStock: boolean;
  sort: SortKey;
  page: number;
};

type RawParams = Record<string, string | string[] | undefined>;

const MAX_VALUES = 50;

const list = (value: string | string[] | undefined) => [
  ...new Set(
    (Array.isArray(value) ? value : value ? [value] : [])
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, MAX_VALUES),
  ),
];

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const wholeNumber = (value: string | string[] | undefined) => {
  const raw = first(value)?.trim();
  if (!raw) return undefined;
  const number = Number(raw);
  return Number.isFinite(number) && number >= 0 ? Math.floor(number) : undefined;
};

export function parseShopFilters(params: RawParams): ShopFilters {
  let minPrice = wholeNumber(params.min);
  let maxPrice = wholeNumber(params.max);
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    [minPrice, maxPrice] = [maxPrice, minPrice];
  }
  const sort = SORT_OPTIONS.find((option) => option.value === first(params.sort))?.value;

  return {
    sizes: list(params.size),
    colours: list(params.colour),
    categories: list(params.category),
    minPrice,
    maxPrice,
    inStock: first(params.stock) === "in",
    sort: sort ?? DEFAULT_SORT,
    page: Math.max(1, wholeNumber(params.page) ?? 1),
  };
}

/* Omits defaults and empty values so URLs stay short and canonical. */
export function filtersToSearchParams(filters: ShopFilters) {
  const params = new URLSearchParams();
  for (const size of filters.sizes) params.append("size", size);
  for (const colour of filters.colours) params.append("colour", colour);
  for (const category of filters.categories) params.append("category", category);
  if (filters.minPrice !== undefined) params.set("min", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set("max", String(filters.maxPrice));
  if (filters.inStock) params.set("stock", "in");
  if (filters.sort !== DEFAULT_SORT) params.set("sort", filters.sort);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params;
}

export function filtersHref(pathname: string, filters: ShopFilters) {
  const query = filtersToSearchParams(filters).toString();
  return query ? `${pathname}?${query}` : pathname;
}

export const hasActiveFilters = (filters: ShopFilters) =>
  filters.sizes.length > 0 ||
  filters.colours.length > 0 ||
  filters.categories.length > 0 ||
  filters.minPrice !== undefined ||
  filters.maxPrice !== undefined ||
  filters.inStock;

/* Apparel sizes in wearing order, then numeric sizes, then "One size". */
const APPAREL_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];

export function compareSizes(a: string, b: string) {
  const rank = (size: string): [number, number, string] => {
    const apparel = APPAREL_ORDER.indexOf(size);
    if (apparel >= 0) return [0, apparel, size];
    const numeric = size.match(/\d+(\.\d+)?/);
    if (numeric) return [1, Number(numeric[0]), size];
    return [2, 0, size];
  };
  const [ga, na, sa] = rank(a);
  const [gb, nb, sb] = rank(b);
  return ga - gb || na - nb || sa.localeCompare(sb);
}
