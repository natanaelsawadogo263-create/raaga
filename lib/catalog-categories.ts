import { categoryShowcases } from "@/lib/raaga-data";
import { tryGetSupabaseServerClient } from "@/lib/supabase/server";

export type HomeCategoryCard = {
  name: string;
  imageUrl: string;
  imageAlt: string;
  href: string;
};

/** Cartes « univers » pour la page d’accueil : DB si dispo, sinon données statiques. */
export async function fetchHomeCategoryCards(): Promise<HomeCategoryCard[]> {
  const supabase = await tryGetSupabaseServerClient();
  if (!supabase) {
    return categoryShowcases.map((c) => ({
      name: c.name,
      imageUrl: c.imageUrl,
      imageAlt: c.imageAlt,
      href: `/produits?q=${encodeURIComponent(c.name)}`,
    }));
  }

  const { data, error } = await supabase
    .from("categories")
    .select("name, image_url")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })
    .limit(24);

  if (error || !data?.length) {
    return categoryShowcases.map((c) => ({
      name: c.name,
      imageUrl: c.imageUrl,
      imageAlt: c.imageAlt,
      href: `/produits?q=${encodeURIComponent(c.name)}`,
    }));
  }

  return data.map((row, i) => {
    const fb = categoryShowcases[i % categoryShowcases.length];
    const imageUrl = row.image_url?.trim() || fb.imageUrl;
    return {
      name: row.name,
      imageUrl,
      imageAlt: row.name,
      href: `/produits?q=${encodeURIComponent(row.name)}`,
    };
  });
}
