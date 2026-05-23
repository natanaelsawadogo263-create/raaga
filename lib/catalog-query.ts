import type { CatalogProduct } from "@/lib/catalog-products";

export const CATALOG_PAGE_SIZE = 20;

export type CatalogSort = "recent" | "price_asc" | "price_desc" | "name";

export type CatalogUrlState = {
  q: string;
  page: number;
  cat: string;
  min: number | null;
  max: number | null;
  sort: CatalogSort;
  stock: "all" | "in_stock";
};

function firstParam(v: string | string[] | undefined): string | undefined {
  if (v == null) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

export function parseCatalogParams(
  sp: Record<string, string | string[] | undefined>,
): CatalogUrlState {
  const q = (firstParam(sp.q) ?? "").trim();
  const pageRaw = firstParam(sp.page);
  const page = Math.max(1, parseInt(pageRaw ?? "1", 10) || 1);
  const cat = (firstParam(sp.cat) ?? "").trim();
  const minRaw = firstParam(sp.min);
  const maxRaw = firstParam(sp.max);
  let min: number | null = minRaw != null && minRaw !== "" ? Number(minRaw) : null;
  let max: number | null = maxRaw != null && maxRaw !== "" ? Number(maxRaw) : null;
  if (min != null && !Number.isFinite(min)) min = null;
  if (max != null && !Number.isFinite(max)) max = null;

  const sortRaw = firstParam(sp.sort);
  const sort: CatalogSort =
    sortRaw === "price_asc" || sortRaw === "price_desc" || sortRaw === "name"
      ? sortRaw
      : "recent";

  const stock = firstParam(sp.stock) === "in_stock" ? "in_stock" : "all";

  return { q, page, cat, min, max, sort, stock };
}

export function filterAndSortCatalog(
  products: CatalogProduct[],
  state: CatalogUrlState,
): CatalogProduct[] {
  let list = [...products];
  const lower = state.q.toLowerCase();
  if (lower) {
    list = list.filter((p) => {
      const name = p.name.toLowerCase();
      const cat = p.category.toLowerCase();
      const city = p.city.toLowerCase();
      const desc = p.description.toLowerCase();
      return name.includes(lower) || cat.includes(lower) || city.includes(lower) || desc.includes(lower);
    });
  }
  if (state.cat) {
    const want = state.cat.trim().toLowerCase();
    list = list.filter((p) => p.category.trim().toLowerCase() === want);
  }
  if (state.min != null) {
    list = list.filter((p) => p.price >= state.min!);
  }
  if (state.max != null) {
    list = list.filter((p) => p.price <= state.max!);
  }
  if (state.stock === "in_stock") {
    list = list.filter((p) => p.stockQuantity > 0);
  }

  switch (state.sort) {
    case "price_asc":
      list.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      list.sort((a, b) => b.price - a.price);
      break;
    case "name":
      list.sort((a, b) => a.name.localeCompare(b.name, "fr", { sensitivity: "base" }));
      break;
    default:
      break;
  }
  return list;
}

export function toSearchParams(state: CatalogUrlState): URLSearchParams {
  const sp = new URLSearchParams();
  if (state.q) sp.set("q", state.q);
  if (state.cat) sp.set("cat", state.cat);
  if (state.min != null) sp.set("min", String(Math.round(state.min)));
  if (state.max != null) sp.set("max", String(Math.round(state.max)));
  if (state.sort !== "recent") sp.set("sort", state.sort);
  if (state.stock === "in_stock") sp.set("stock", "in_stock");
  if (state.page > 1) sp.set("page", String(state.page));
  return sp;
}

export function produitsHref(state: CatalogUrlState): string {
  const s = toSearchParams(state).toString();
  return s ? `/produits?${s}` : "/produits";
}

export function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }));
}

export function priceBounds(products: CatalogProduct[]): { min: number; max: number } {
  if (!products.length) return { min: 0, max: 0 };
  let min = products[0]!.price;
  let max = min;
  for (const p of products) {
    if (p.price < min) min = p.price;
    if (p.price > max) max = p.price;
  }
  return { min, max };
}

export function getPaginationRange(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  if (total <= 1) return [1];
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const set = new Set<number>();
  set.add(1);
  set.add(total);
  for (let i = current - 1; i <= current + 1; i++) {
    if (i >= 1 && i <= total) set.add(i);
  }
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | "ellipsis")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) out.push("ellipsis");
    out.push(p);
    prev = p;
  }
  return out;
}
