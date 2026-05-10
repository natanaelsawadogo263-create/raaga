import { NextResponse } from "next/server";
import { filterAndSortCatalog, uniqueSorted, type CatalogUrlState } from "@/lib/catalog-query";
import { fetchCatalogProducts } from "@/lib/catalog-products";
import type { CatalogSearchResponse } from "@/lib/catalog-search-types";

const MAX_PRODUCTS = 12;
const MAX_CATEGORIES = 8;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim().slice(0, 120);

  if (!q) {
    const empty: CatalogSearchResponse = { query: "", products: [], categories: [], total: 0 };
    return NextResponse.json(empty);
  }

  const products = await fetchCatalogProducts();
  const state: CatalogUrlState = {
    q,
    page: 1,
    cat: "",
    min: null,
    max: null,
    sort: "recent",
    stock: "all",
  };
  const filtered = filterAndSortCatalog(products, state);
  const categories = uniqueSorted(filtered.map((p) => p.category)).slice(0, MAX_CATEGORIES);
  const preview = filtered.slice(0, MAX_PRODUCTS).map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    city: p.city,
    price: p.price,
    imageUrl: p.imageUrl,
  }));

  const body: CatalogSearchResponse = {
    query: q,
    products: preview,
    categories,
    total: filtered.length,
  };

  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}
