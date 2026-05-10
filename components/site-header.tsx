import Link from "next/link";
import { Bike, ShieldCheck } from "lucide-react";
import { signOutAction } from "@/app/actions";
import { CartIconBadge } from "@/components/cart-icon-badge";
import { HeaderNavLinks } from "@/components/header-nav-links";
import { HeaderSearchRegion } from "@/components/header-search-region";
import { MobileNavDrawer } from "@/components/mobile-nav-drawer";
import { SiteLogo } from "@/components/site-logo";
import { getSiteCartBadge } from "@/lib/site-cart-server";
import { tryGetSupabaseServerClient } from "@/lib/supabase/server";

const guestLinks = [
  { href: "/", label: "Accueil" },
  { href: "/produits", label: "Produits" },
  { href: "/promo", label: "Promo" },
];

const customerAuthLinks = [
  { href: "/", label: "Accueil" },
  { href: "/produits", label: "Produits" },
  { href: "/promo", label: "Promo" },
  { href: "/mes-commandes", label: "Mes commandes" },
  { href: "/suivi", label: "Suivi" },
];

const driverAuthLinks = [
  { href: "/livreur", label: "Tableau de bord" },
  { href: "/livreur/taches", label: "Tâches" },
  { href: "/livreur/en-cours", label: "Course en cours" },
];

const adminAuthLinks = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/", label: "Accueil" },
  { href: "/produits", label: "Produits" },
];

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20a8 8 0 0 1 16 0" />
    </svg>
  );
}

export async function SiteHeader() {
  const supabase = await tryGetSupabaseServerClient();
  const auth = supabase ? await supabase.auth.getUser() : null;
  const user = auth?.data.user ?? null;
  const isAuthenticated = Boolean(user);

  let role: string | null = null;
  if (supabase && user) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    role = profile?.role ?? null;
  }
  const isDriver = role === "driver";
  const isAdmin = role === "admin" || role === "super_admin";

  const navLinks = !isAuthenticated
    ? guestLinks
    : isDriver
      ? driverAuthLinks
      : isAdmin
        ? adminAuthLinks
        : customerAuthLinks;

  const userName =
    typeof user?.user_metadata?.first_name === "string" && user.user_metadata.first_name.trim()
      ? user.user_metadata.first_name.trim()
      : user?.email?.split("@")[0] ?? "Compte";
  const userInitial = userName.charAt(0).toUpperCase();

  const { isCustomer, serverCartCount } = await getSiteCartBadge();

  return (
    <header className="sticky top-0 z-[200] border-b border-border bg-card/95 backdrop-blur">
      <div className="container-raaga flex flex-wrap items-center gap-x-2 gap-y-1.5 py-1.5 sm:py-2 md:gap-x-3 md:gap-y-1.5 md:py-2.5">
        {/* Mobile: burger first (z-210), then logo (z-1), side by side with a visible gap — not overlapping; desktop: logo only */}
        <div className="flex min-w-0 shrink-0 items-center gap-3 md:gap-0">
          <div className="relative z-[210] shrink-0 md:hidden">
            <MobileNavDrawer isAuthenticated={isAuthenticated} role={role} />
          </div>
          <div className="relative z-[1] min-w-0 md:z-auto">
            <SiteLogo />
          </div>
        </div>

        <HeaderSearchRegion />

        <div className="ml-auto hidden shrink-0 flex-wrap items-center gap-5 md:flex">
        <HeaderNavLinks items={navLinks} />
        <div className="flex items-center gap-2">
          <CartIconBadge isCustomer={isCustomer} serverCount={serverCartCount} />
          {isAuthenticated ? (
            <details className="relative">
              <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl border border-border px-2 py-1.5 text-xs font-semibold text-foreground transition hover:text-brand sm:text-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-foreground sm:text-xs">
                  {userInitial}
                </span>
                <span className="hidden sm:inline">{userName}</span>
              </summary>
              <div className="absolute right-0 top-10 z-50 min-w-56 rounded-xl border border-border bg-card p-2 shadow-lg">
                {isDriver ? (
                  <>
                    <Link
                      href="/livreur"
                      className="mb-1 flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2 text-sm font-bold text-brand ring-1 ring-orange-200/70 hover:bg-orange-100"
                    >
                      <Bike className="h-4 w-4" aria-hidden />
                      Espace livreur
                    </Link>
                    <Link href="/livreur/taches" className="flex rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted">
                      Tâches disponibles
                    </Link>
                    <Link href="/livreur/en-cours" className="flex rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted">
                      Course en cours
                    </Link>
                    <Link href="/livreur/profil" className="flex rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted">
                      Mon profil
                    </Link>
                  </>
                ) : isAdmin ? (
                  <>
                    <Link
                      href="/admin"
                      className="mb-1 flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2 text-sm font-bold text-brand ring-1 ring-orange-200/70 hover:bg-orange-100"
                    >
                      <ShieldCheck className="h-4 w-4" aria-hidden />
                      Espace admin
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/mes-commandes" className="flex rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted">
                      Mes commandes
                    </Link>
                    <Link href="/suivi" className="flex rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted">
                      Suivi
                    </Link>
                  </>
                )}
                <Link href="/aide" className="flex rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted">
                  Aide
                </Link>
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-muted"
                  >
                    <UserIcon />
                    Deconnexion
                  </button>
                </form>
              </div>
            </details>
          ) : (
            <Link
              href="/connexion"
              className="rounded-xl bg-brand px-3 py-1.5 text-xs font-semibold text-brand-contrast sm:text-sm"
            >
              Connexion
            </Link>
          )}
        </div>
        </div>
      </div>
    </header>
  );
}
