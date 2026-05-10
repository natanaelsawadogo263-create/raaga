"use client";

import Link from "next/link";
import { signOutAction } from "@/app/actions";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";

function BurgerIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20a8 8 0 0 1 16 0" />
    </svg>
  );
}

type Props = {
  isAuthenticated: boolean;
  role?: string | null;
};

const guestLinks = [
  { href: "/", label: "Accueil" },
  { href: "/produits", label: "Produits" },
  { href: "/promo", label: "Promo" },
  { href: "/panier", label: "Panier" },
  { href: "/connexion", label: "Connexion" },
  { href: "/inscription-client", label: "Inscription client" },
  { href: "/inscription-livreur", label: "Inscription livreur" },
  { href: "/aide", label: "Aide" },
  { href: "/a-propos", label: "A propos" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
];

const customerAuthLinks = [
  { href: "/", label: "Accueil" },
  { href: "/produits", label: "Produits" },
  { href: "/promo", label: "Promo" },
  { href: "/panier", label: "Panier" },
  { href: "/commande", label: "Commander" },
  { href: "/mes-commandes", label: "Mes commandes" },
  { href: "/suivi", label: "Suivi livraison" },
  { href: "/aide", label: "Aide" },
  { href: "/a-propos", label: "A propos" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
];

const driverAuthLinks = [
  { href: "/livreur/taches", label: "Tâches disponibles" },
  { href: "/livreur/en-cours", label: "Course en cours" },
  { href: "/livreur/historique", label: "Historique" },
  { href: "/livreur/portefeuille", label: "Portefeuille" },
  { href: "/livreur/notes", label: "Mes notes" },
  { href: "/livreur/profil", label: "Mon profil" },
  { href: "/aide", label: "Aide" },
];

const adminAuthLinks = [
  { href: "/admin/commandes", label: "Commandes" },
  { href: "/admin/produits", label: "Produits" },
  { href: "/admin/livreurs", label: "Livreurs" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/aide", label: "Aide" },
];

export function MobileNavDrawer({ isAuthenticated, role }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const linkClass =
    "flex rounded-xl px-4 py-3 text-[15px] font-medium text-foreground transition-colors hover:bg-muted active:bg-muted/80";
  const isDriver = role === "driver";
  const isAdmin = role === "admin" || role === "super_admin";
  const links = !isAuthenticated
    ? guestLinks
    : isDriver
      ? driverAuthLinks
      : isAdmin
        ? adminAuthLinks
        : customerAuthLinks;

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-nav-drawer-panel"
        aria-label="Ouvrir le menu"
        className="flex rounded-lg bg-background/95 p-1.5 shadow-sm ring-1 ring-border/60 text-foreground transition hover:bg-muted/80 active:opacity-80"
      >
        <BurgerIcon />
      </button>
      {mounted
        ? createPortal(
            <>
              <div
                className={`fixed inset-0 z-[10000] bg-black/45 transition-[opacity,visibility] duration-300 ease-out md:hidden ${
                  open ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"
                }`}
                aria-hidden={!open}
                onClick={() => setOpen(false)}
              />

              <div
                id="mobile-nav-drawer-panel"
                role="dialog"
                aria-modal="true"
                aria-label="Menu"
                className={`fixed inset-y-0 left-0 z-[10001] flex w-[min(85vw,20rem)] max-w-full flex-col border-r border-border bg-card shadow-2xl transition-transform duration-300 ease-out md:hidden ${
                  open ? "translate-x-0" : "-translate-x-full pointer-events-none"
                }`}
              >
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <span className="text-base font-bold text-foreground">Menu</span>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Fermer le menu"
                    className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    <CloseIcon />
                  </button>
                </div>

                <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
                  {isAuthenticated && isDriver ? (
                    <Link
                      href="/livreur"
                      onClick={() => setOpen(false)}
                      className="mb-2 flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-3 text-[15px] font-bold text-brand ring-1 ring-orange-200/70 hover:bg-orange-100"
                    >
                      Espace livreur
                    </Link>
                  ) : null}
                  {isAuthenticated && isAdmin ? (
                    <Link
                      href="/admin"
                      onClick={() => setOpen(false)}
                      className="mb-2 flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-3 text-[15px] font-bold text-brand ring-1 ring-orange-200/70 hover:bg-orange-100"
                    >
                      Espace admin
                    </Link>
                  ) : null}
                  {links.map((link) => (
                    <Link key={link.href} href={link.href} className={linkClass} onClick={() => setOpen(false)}>
                      {link.label}
                    </Link>
                  ))}
                  {isAuthenticated ? (
                    <form action={signOutAction} className="mt-auto border-t border-border pt-3">
                      <button
                        type="submit"
                        className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-left text-[15px] font-medium text-red-600 transition-colors hover:bg-red-50 active:bg-red-100/80"
                      >
                        <UserIcon />
                        Deconnexion
                      </button>
                    </form>
                  ) : null}
                </nav>
              </div>
            </>,
            document.body,
          )
        : null}
    </div>
  );
}
