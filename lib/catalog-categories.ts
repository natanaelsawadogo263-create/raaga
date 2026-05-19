import { produitsHref } from "@/lib/catalog-query";
import { tryGetSupabaseServerClient } from "@/lib/supabase/server";

export type HomeCategoryCard = {
  name: string;
  imageUrl: string;
  imageAlt: string;
  href: string;
};

const DEFAULT_CATEGORY_IMAGE = "/banner.png";

/** Cartes catégories pour l’accueil : uniquement les catégories actives créées dans l’admin. */
export async function fetchHomeCategoryCards(): Promise<HomeCategoryCard[]> {
  const supabase = await tryGetSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("categories")
    .select("name, image_url")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })
    .limit(24);

  if (error || !data?.length) return [];

  return data.map((row) => {
    const name = row.name.trim();
    return {
      name,
      imageUrl: row.image_url?.trim() || DEFAULT_CATEGORY_IMAGE,
      imageAlt: name,
      href: produitsHref({
        q: "",
        page: 1,
        cat: name,
        min: null,
        max: null,
        sort: "recent",
        stock: "all",
      }),
    };
  });
}
