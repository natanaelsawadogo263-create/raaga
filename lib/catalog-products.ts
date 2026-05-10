import type { ProductBadgeStatus } from "@/components/status-badge";
import { categoryShowcases, featuredProducts } from "@/lib/raaga-data";
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
  description: string | null;
  variant_options: unknown;
  product_images: ProductImageRow[] | null;
  categories: { image_url: string | null } | null;
};

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
    imageUrl: p.image.startsWith("http") ? p.image : categoryFallbackImage(p.category),
  }));
}

const PRODUCT_LIST_SELECT =
  "id, name, category, city, price_cfa, compare_at_price_cfa, stock_quantity, status, description, variant_options, product_images ( image_url, is_primary, sort_order ), categories ( image_url )";

function mapRowsToCatalog(rows: ProductRowDb[]): CatalogProduct[] {
  return rows.map((item) => {
    const imgs = item.product_images;
    const primary = pickPrimaryImage(imgs);
    const catCover = item.categories?.image_url?.trim() || null;
    const fallback = categoryFallbackImage(item.category);
    return {
      id: item.id,
      name: item.name,
      category: item.category,
      city: item.city,
      description: item.description ?? "",
      price: item.price_cfa,
      compareAtPriceCfa:
        item.compare_at_price_cfa != null && item.compare_at_price_cfa > item.price_cfa
          ? item.compare_at_price_cfa
          : null,
      stockQuantity: item.stock_quantity,
      status: mapStatus(item.status),
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

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_LIST_SELECT)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || data == null) {
    return fromFeatured().slice(0, limit);
  }

  return mapRowsToCatalog(data as unknown as ProductRowDb[]);
}

export async function fetchCatalogProducts(): Promise<CatalogProduct[]> {
  const supabase = await tryGetSupabaseServerClient();
  if (!supabase) {
    return fromFeatured();
  }

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_LIST_SELECT)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error || data == null) {
    return fromFeatured();
  }

  return mapRowsToCatalog(data as unknown as ProductRowDb[]);
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

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_LIST_SELECT)
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const row = data as unknown as ProductRowDb;
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
  const fallback = categoryFallbackImage(row.category);
  const images =
    sortedUrls.length > 0 ? sortedUrls : catCover ? [catCover] : fallback ? [fallback] : [];

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    city: row.city,
    description: row.description ?? "",
    price: row.price_cfa,
    compareAtPriceCfa:
      row.compare_at_price_cfa != null && row.compare_at_price_cfa > row.price_cfa
        ? row.compare_at_price_cfa
        : null,
    stockQuantity: row.stock_quantity,
    status: mapStatus(row.status),
    imageUrl: images[0] ?? null,
    images,
    variantOptions: parseVariantOptions(row.variant_options),
  };
}

export function relatedCatalogProducts(all: CatalogProduct[], category: string, excludeId: string, limit = 8): CatalogProduct[] {
  return all.filter((p) => p.category === category && p.id !== excludeId).slice(0, limit);
}
