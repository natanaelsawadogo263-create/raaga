import { MobileBottomNavClient, type MobileBottomNavItem } from "@/components/mobile-bottom-nav-client";
import { getSiteCartBadge } from "@/lib/site-cart-server";
import { tryGetSupabaseServerClient } from "@/lib/supabase/server";

const guestItems: MobileBottomNavItem[] = [
  { href: "/", label: "Accueil", icon: "home" },
  { href: "/produits", label: "Produits", icon: "grid" },
  { href: "/panier", label: "Panier", icon: "cart" },
  { href: "/connexion", label: "Compte", icon: "user" },
];

const authItems: MobileBottomNavItem[] = [
  { href: "/", label: "Accueil", icon: "home" },
  { href: "/produits", label: "Produits", icon: "grid" },
  { href: "/panier", label: "Panier", icon: "cart" },
  { href: "/mes-commandes", label: "Compte", icon: "user" },
];

export async function MobileBottomNav() {
  const supabase = await tryGetSupabaseServerClient();
  const auth = supabase ? await supabase.auth.getUser() : null;
  const user = auth?.data.user ?? null;
  const isAuthenticated = Boolean(user);

  const { isCustomer, serverCartCount } = await getSiteCartBadge();

  const items = isAuthenticated ? authItems : guestItems;

  return (
    <MobileBottomNavClient items={items} isCustomer={isCustomer} serverCartCount={serverCartCount} />
  );
}
