import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProductBadgeStatus } from "@/components/status-badge";
import { categoryShowcases, featuredProducts } from "@/lib/raaga-data";
import type { Database } from "@/lib/supabase/database.types";
import { tryGetSupabaseServerClient } from "@/lib/supabase/server";

export type CatalogProduct = {
  id: string;
  name: string;
  category: string;
  city: string;
  description: string;
  price: number;
  /** Prix catalogue avant promo (affiché barré s'il est supérieur au prix actuel et statut promotion). */
  compareAtPriceCfa: number | null;
  stockQuantity: number;
  status: ProductBadgeStatus;
  /** Produit poids lourd (livraison spéciale, discussion post-commande). */
  isHeavy: boolean;
  /** URL absolue (ex. Unsplash) ou chemin public pour next/image */
  imageUrl: string | null;
};

export type CatalogProductDetail = CatalogProduct & {
  images: string[];
  variantOptions: { name: string; values: string[] }[];
};

export type ProductImageRow = {
  image_url: string;
  is_primary: boolean;
  sort_order: number;
};

/** Ligne brute Supabase (jointure product_images) — types générés non utilisés ici */
type ProductRowDb = {
  id: string;
  name: string;
  category: string;
  city: string;
  price_cfa: number;
  compare_at_price_cfa: number | null;
  stock_quantity: number;
  status: string;
  is_heavy?: boolean | null;
  description: string | null;
  variant_options: unknown;
  product_images: ProductImageRow[] | null;
  categories: { name: string | null; image_url: string | null } | null;
};

function resolveProductCategory(item: ProductRowDb): string {
  const joined = item.categories?.name?.trim();
  if (joined) {
    return joined;
  }
  return (item.category ?? "").trim();
}

function parseVariantOptions(raw: unknown): { name: string; values: string[] }[] {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return [];
  }
  const options: { name: string; values: string[] }[] = [];
  for (const [name, valueRaw] of Object.entries(raw as Record<string, unknown>)) {
    if (!Array.isArray(valueRaw)) {
      continue;
    }
    const values = valueRaw
      .map((v) => String(v ?? "").trim())
      .filter(Boolean);
    if (!name.trim() || values.length === 0) {
      continue;
    }
    options.push({ name: name.trim(), values: [...new Set(values)] });
  }
  return options;
}

function mapStatus(raw: string): ProductBadgeStatus {
  if (raw === "best_seller") {
    return "best_seller";
  }
  if (raw === "best-seller") {
    return "best-seller";
  }
  if (raw === "normal" || raw === "promotion" || raw === "nouveaute" || raw === "rupture") {
    return raw;
  }
  return "normal";
}

export function pickPrimaryImage(images: ProductImageRow[] | null | undefined): string | null {
  if (!images?.length) {
    return null;
  }
  const sorted = [...images].sort((a, b) => {
    if (a.is_primary !== b.is_primary) {
      return a.is_primary ? -1 : 1;
    }
    return a.sort_order - b.sort_order;
  });
  return sorted[0]?.image_url ?? null;
}

export function categoryFallbackImage(category: string): string | null {
  const c = categoryShowcases.find((x) => x.name === category);
  return c?.imageUrl ?? categoryShowcases[0]?.imageUrl ?? null;
}

function fromFeatured(): CatalogProduct[] {
  return featuredProducts.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    city: p.city,
    description: `${p.name} — ${p.category}. Article disponible sur Raaga avec livraison suivie.`,
    price: p.price,
    compareAtPriceCfa:
      typeof p.compareAtPrice === "number" && p.compareAtPrice > p.price ? p.compareAtPrice : null,
    stockQuantity: p.status === "rupture" ? 0 : 12,
    status: mapStatus(p.status),
    isHeavy: false,
    imageUrl: p.image.startsWith("http") ? p.image : categoryFallbackImage(p.category),
  }));
}

const PRODUCT_LIST_SELECT =
  "id, name, category, city, price_cfa, compare_at_price_cfa, stock_quantity, status, is_heavy, description, variant_options, product_images ( image_url, is_primary, sort_order ), categories ( name, image_url )";

const PRODUCT_LIST_SELECT_LEGACY =
  "id, name, category, city, price_cfa, compare_at_price_cfa, stock_quantity, status, description, variant_options, product_images ( image_url, is_primary, sort_order ), categories ( name, image_url )";

function isMissingHeavyColumnError(message: string | undefined): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  return m.includes("is_heavy") || (m.includes("column") && m.includes("does not exist"));
}

async function fetchActiveProductRows(
  supabase: SupabaseClient<Database>,
  limit?: number,
): Promise<{ rows: ProductRowDb[] | null; error: string | null }> {
  let query = supabase
    .from("products")
    .select(PRODUCT_LIST_SELECT)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (limit != null) {
    query = query.limit(limit);
  } else {
    query = query.limit(1000);
  }

  let { data, error } = await query;

  if (error && isMissingHeavyColumnError(error.message)) {
    let legacyQuery = supabase
      .from("products")
      .select(PRODUCT_LIST_SELECT_LEGACY)
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (limit != null) {
      legacyQuery = legacyQuery.limit(limit);
    } else {
      legacyQuery = legacyQuery.limit(1000);
    }
    const retry = await legacyQuery;
    data = retry.data as typeof data;
    error = retry.error;
  }

  if (error) {
    console.error("[catalog] lecture produits Supabase:", error.message);
    return { rows: null, error: error.message };
  }

  return { rows: (data ?? []) as unknown as ProductRowDb[], error: null };
}

function mapRowsToCatalog(rows: ProductRowDb[]): CatalogProduct[] {
  return rows.map((item) => {
    const imgs = item.product_images;
    const primary = pickPrimaryImage(imgs);
    const category = resolveProductCategory(item);
    const catCover = item.categories?.image_url?.trim() || null;
    const fallback = categoryFallbackImage(category);
    return {
      id: item.id,
      name: item.name,
      category,
      city: item.city,
      description: item.description ?? "",
      price: item.price_cfa,
      compareAtPriceCfa:
        item.compare_at_price_cfa != null && item.compare_at_price_cfa > item.price_cfa
          ? item.compare_at_price_cfa
          : null,
      stockQuantity: item.stock_quantity,
      status: mapStatus(item.status),
      isHeavy: item.is_heavy === true,
      imageUrl: primary || catCover || fallback,
    };
  });
}

/** Derniers produits actifs pour la vitrine accueil (requête légère). */
export async function fetchHomeSpotlightProducts(limit = 8): Promise<CatalogProduct[]> {
  const supabase = await tryGetSupabaseServerClient();
  if (!supabase) {
    return fromFeatured().slice(0, limit);
  }

  const { rows, error } = await fetchActiveProductRows(supabase, limit);
  if (error || rows == null) {
    return [];
  }

  return mapRowsToCatalog(rows);
}

export async function fetchCatalogProducts(): Promise<CatalogProduct[]> {
  const supabase = await tryGetSupabaseServerClient();
  if (!supabase) {
    return fromFeatured();
  }

  const { rows, error } = await fetchActiveProductRows(supabase);
  if (error || rows == null) {
    return [];
  }

  return mapRowsToCatalog(rows);
}

export async function fetchProductById(id: string): Promise<CatalogProductDetail | null> {
  const supabase = await tryGetSupabaseServerClient();
  if (!supabase) {
    const fp = featuredProducts.find((p) => p.id === id);
    if (!fp) {
      return null;
    }
    const row = fromFeatured().find((p) => p.id === id);
    if (!row) {
      return null;
    }
    const imgs = row.imageUrl ? [row.imageUrl] : [];
    return { ...row, images: imgs, variantOptions: [] };
  }

  let { data, error } = await supabase
    .from("products")
    .select(PRODUCT_LIST_SELECT)
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (error && isMissingHeavyColumnError(error.message)) {
    const retry = await supabase
      .from("products")
      .select(PRODUCT_LIST_SELECT_LEGACY)
      .eq("id", id)
      .eq("is_active", true)
      .maybeSingle();
    data = retry.data as typeof data;
    error = retry.error;
  }

  if (error || !data) {
    if (error) {
      console.error("[catalog] fiche produit:", error.message);
    }
    return null;
  }

  const row = data as unknown as ProductRowDb;
  const category = resolveProductCategory(row);
  const imgs = row.product_images ?? [];
  const sortedUrls = [...imgs]
    .sort((a, b) => {
      if (a.is_primary !== b.is_primary) {
        return a.is_primary ? -1 : 1;
      }
      return a.sort_order - b.sort_order;
    })
    .map((i) => i.image_url);

  const catCover = row.categories?.image_url?.trim() || null;
  const fallback = categoryFallbackImage(category);
  const images =
    sortedUrls.length > 0 ? sortedUrls : catCover ? [catCover] : fallback ? [fallback] : [];

  return {
    id: row.id,
    name: row.name,
    category,
    city: row.city,
    description: row.description ?? "",
    price: row.price_cfa,
    compareAtPriceCfa:
      row.compare_at_price_cfa != null && row.compare_at_price_cfa > row.price_cfa
        ? row.compare_at_price_cfa
        : null,
    stockQuantity: row.stock_quantity,
    status: mapStatus(row.status),
    isHeavy: row.is_heavy === true,
    imageUrl: images[0] ?? null,
    images,
    variantOptions: parseVariantOptions(row.variant_options),
  };
}

export function relatedCatalogProducts(all: CatalogProduct[], category: string, excludeId: string, limit = 8): CatalogProduct[] {
  return all.filter((p) => p.category === category && p.id !== excludeId).slice(0, limit);
}
