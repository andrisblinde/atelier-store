/*
 * Product search URL state (/search?q=...&sort=...&page=...). Client-safe:
 * the query itself lives in src/db/queries/products.ts (searchProducts).
 */
import { SORT_OPTIONS } from "@/lib/shop-filters";

export const SEARCH_SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  ...SORT_OPTIONS,
] as const;

export type SearchSortKey = (typeof SEARCH_SORT_OPTIONS)[number]["value"];

const MAX_QUERY_LENGTH = 100;
const MAX_TERMS = 6;

export type SearchState = {
  query: string;
  /* Distinct lower-case words from the query; every one must match. */
  terms: string[];
  sort: SearchSortKey;
  page: number;
};

type RawParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export function parseSearchParams(params: RawParams): SearchState {
  const query = (first(params.q) ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_QUERY_LENGTH);
  const terms = [...new Set(query.toLowerCase().split(" ").filter(Boolean))].slice(0, MAX_TERMS);
  const sort =
    SEARCH_SORT_OPTIONS.find((option) => option.value === first(params.sort))?.value ?? "relevance";
  const page = Math.max(1, Math.floor(Number(first(params.page))) || 1);
  return { query, terms, sort, page };
}

export function searchHref({ query, sort, page }: Pick<SearchState, "query" | "sort" | "page">) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (sort !== "relevance") params.set("sort", sort);
  if (page > 1) params.set("page", String(page));
  const search = params.toString();
  return search ? `/search?${search}` : "/search";
}
