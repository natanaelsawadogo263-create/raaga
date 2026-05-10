import { tryGetSupabaseServerClient } from "@/lib/supabase/server";

export type SiteCartBadge = {
  /** Panier serveur réservé aux comptes avec rôle `customer`. */
  isCustomer: boolean;
  serverCartCount: number;
};

export async function getSiteCartBadge(): Promise<SiteCartBadge> {
  const supabase = await tryGetSupabaseServerClient();
  if (!supabase) {
    return { isCustomer: false, serverCartCount: 0 };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { isCustomer: false, serverCartCount: 0 };
  }

  const { data: profile } = await supabase.from("user_profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "customer") {
    return { isCustomer: false, serverCartCount: 0 };
  }

  const { count } = await supabase
    .from("carts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  return { isCustomer: true, serverCartCount: count ?? 0 };
}
