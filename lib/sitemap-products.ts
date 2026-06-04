import { tryGetSupabaseServerClient } from "@/lib/supabase/server";

export type SitemapProductRow = {
  id: string;
  updated_at: string;
};

/** Produits actifs indexables (fiches `/produits/[id]`). */
export async function fetchSitemapProducts(): Promise<SitemapProductRow[]> {
  const supabase = await tryGetSupabaseServerClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("products")
    .select("id, updated_at")
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(5000);

  if (error) {
    console.error("[sitemap] produits:", error.message);
    return [];
  }

  return data ?? [];
}
