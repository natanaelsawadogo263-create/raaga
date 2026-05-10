"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  ShoppingBag,
  X,
} from "lucide-react";
import { signOutAction, updateDriverAvailabilityAction } from "@/app/actions";
import { livreurNavItems } from "@/lib/livreur-nav";

function navActive(pathname: string, href: string) {
  if (href === "/livreur") return pathname === "/livreur" || pathname === "/livreur/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

type LivreurShellProps = {
  driverFullName: string;
  driverFirstName: string;
  avatarUrl: string | null;
  isAvailable: boolean;
  approved: boolean;
  unreadNotifications: number;
  notifications: { id: string; text: string; time: string }[];
  children: React.ReactNode;
};

function useOnOutsideClose(ref: React.RefObject<HTMLElement | null>, open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open, onClose, ref]);
}

function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

function LivreurTopBar({
  driverFullName,
  avatarUrl,
  isAvailable,
  approved,
  unreadNotifications,
  notifications,
  onOpenMobileNav,
}: {
  driverFullName: string;
  avatarUrl: string | null;
  isAvailable: boolean;
  approved: boolean;
  unreadNotifications: number;
  notifications: { id: string; text: string; time: string }[];
  onOpenMobileNav?: () => void;
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [notifUnread, setNotifUnread] = useState(unreadNotifications);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useOnOutsideClose(notifRef, notifOpen, () => setNotifOpen(false));
  useOnOutsideClose(userRef, userOpen, () => setUserOpen(false));

  function markAllRead() {
    setNotifUnread(0);
    setNotifOpen(false);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 px-3 py-2.5 shadow-sm backdrop-blur-md sm:px-4">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-2 sm:gap-3">
        {onOpenMobileNav ? (
          <button
            type="button"
            onClick={onOpenMobileNav}
            className="flex rounded-xl p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        ) : null}

        <div className="ml-auto flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Availability toggle */}
          {approved ? (
            <form action={updateDriverAvailabilityAction}>
              <input type="hidden" name="is_available" value={isAvailable ? "false" : "true"} />
              <button
                type="submit"
                className={`relative inline-flex h-9 items-center rounded-full px-1 transition ${
                  isAvailable ? "bg-emerald-500" : "bg-slate-300"
                }`}
                aria-pressed={isAvailable}
                aria-label={isAvailable ? "Passer en pause" : "Devenir disponible"}
                title={isAvailable ? "Vous êtes disponible — cliquer pour mettre en pause" : "Hors ligne — cliquer pour devenir disponible"}
              >
                <span
                  className={`flex h-7 items-center rounded-full bg-white px-3 text-[11px] font-bold shadow ${
                    isAvailable ? "text-emerald-700" : "text-slate-600"
                  }`}
                >
                  <span
                    className={`mr-1.5 h-2 w-2 rounded-full ${isAvailable ? "bg-emerald-500" : "bg-slate-400"}`}
                  />
                  {isAvailable ? "Disponible" : "Hors ligne"}
                </span>
              </button>
            </form>
          ) : null}

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setNotifOpen((o) => !o)}
              className="relative rounded-xl p-2 text-slate-700 transition hover:bg-slate-100"
              aria-expanded={notifOpen}
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              {notifUnread > 0 ? (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF7A00] px-1 text-[9px] font-bold text-white">
                  {notifUnread}
                </span>
              ) : null}
            </button>
            {notifOpen ? (
              <div className="absolute right-0 top-full z-50 mt-2 w-[min(92vw,320px)] rounded-2xl border border-slate-200 bg-white py-2 shadow-xl ring-1 ring-black/5">
                <div className="flex items-center justify-between border-b border-slate-100 px-3 pb-2">
                  <p className="text-xs font-bold text-slate-900">Notifications</p>
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="text-[11px] font-semibold text-[#FF7A00] hover:underline"
                  >
                    Tout marquer lu
                  </button>
                </div>
                {notifications.length === 0 ? (
                  <p className="px-3 py-4 text-center text-xs text-slate-500">
                    Aucune notification.
                  </p>
                ) : (
                  <ul className="max-h-64 overflow-y-auto">
                    {notifications.map((n) => (
                      <li key={n.id} className="border-b border-slate-50 last:border-0">
                        <button
                          type="button"
                          className="w-full px-3 py-2.5 text-left text-xs transition hover:bg-slate-50"
                          onClick={() => {
                            setNotifUnread((c) => Math.max(0, c - 1));
                            setNotifOpen(false);
                          }}
                        >
                          <p className="font-semibold text-slate-800">{n.text}</p>
                          <p className="mt-0.5 text-[11px] text-slate-500">{n.time}</p>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
          </div>

          {/* User menu */}
          <div className="relative" ref={userRef}>
            <button
              type="button"
              onClick={() => setUserOpen((o) => !o)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 shadow-sm transition hover:bg-slate-50"
              aria-expanded={userOpen}
              aria-label="Menu compte"
            >
              <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-orange-100 to-amber-100 text-xs font-black text-[#FF7A00] ring-1 ring-orange-200/60">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt=""
                    fill
                    sizes="32px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <span>{initials(driverFullName)}</span>
                )}
              </span>
              <div className="hidden leading-tight sm:block">
                <p className="text-xs font-bold text-slate-900">{driverFullName}</p>
                <p className="text-[11px] text-slate-500">Livreur</p>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
            </button>
            {userOpen ? (
              <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-2xl border border-slate-200 bg-white py-1 shadow-xl ring-1 ring-black/5">
                <Link
                  href="/livreur/profil"
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  onClick={() => setUserOpen(false)}
                >
                  Profil
                </Link>
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 border-t border-slate-50 px-3 py-2.5 text-left text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Déconnexion
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

function SidebarBody({
  pathname,
  driverFullName,
  avatarUrl,
  isAvailable,
  approved,
  onCloseMobile,
}: {
  pathname: string;
  driverFullName: string;
  avatarUrl: string | null;
  isAvailable: boolean;
  approved: boolean;
  onCloseMobile?: () => void;
}) {
  return (
    <>
      <div className="flex items-center gap-2.5 px-1">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-[#FF7A00] shadow-sm ring-1 ring-orange-200/50">
          <ShoppingBag className="h-5 w-5" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-black leading-none tracking-tight text-[#FF7A00]">Raaga</p>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Espace livreur
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
        <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-2 ring-orange-200/60">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt=""
              fill
              sizes="44px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <span className="text-sm font-black text-[#FF7A00]">
              {initials(driverFullName)}
            </span>
          )}
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-slate-900">{driverFullName}</p>
          <span
            className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
              !approved
                ? "bg-amber-100 text-amber-800 ring-1 ring-amber-200"
                : isAvailable
                  ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200"
                  : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                !approved ? "bg-amber-500" : isAvailable ? "bg-emerald-500" : "bg-slate-400"
              }`}
            />
            {!approved ? "Compte en attente" : isAvailable ? "Disponible" : "Hors ligne"}
          </span>
        </div>
      </div>

      <nav className="mt-5 flex flex-1 flex-col gap-1">
        {livreurNavItems.map((item) => {
          const Icon = item.icon;
          const active = navActive(pathname, item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => onCloseMobile?.()}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition ${
                active
                  ? "bg-[#FF7A00] text-white shadow-md shadow-orange-500/25"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl bg-gradient-to-br from-orange-100 via-amber-50 to-orange-50 p-4 ring-1 ring-orange-200/40">
        <p className="text-xs font-bold leading-snug text-slate-800">
          Travaillez en sécurité 🛵
        </p>
        <p className="mt-1 text-[11px] leading-snug text-slate-700/90">
          Confirmez chaque livraison avec le code à 4 chiffres du client.
        </p>
      </div>
    </>
  );
}

export function LivreurShell({
  driverFullName,
  driverFirstName,
  avatarUrl,
  isAvailable,
  approved,
  unreadNotifications,
  notifications,
  children,
}: LivreurShellProps) {
  const pathname = usePathname() ?? "/";
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  const heading = (() => {
    if (pathname.startsWith("/livreur/taches")) return "Tâches disponibles";
    if (pathname.startsWith("/livreur/en-cours")) return "Course en cours";
    if (pathname.startsWith("/livreur/historique")) return "Historique";
    if (pathname.startsWith("/livreur/portefeuille")) return "Portefeuille";
    if (pathname.startsWith("/livreur/notes")) return "Mes notes";
    if (pathname.startsWith("/livreur/profil")) return "Mon profil";
    return `Bonjour ${driverFirstName}, prêt à livrer 🛵`;
  })();

  const subheading = (() => {
    if (pathname.startsWith("/livreur/taches")) return "Acceptez la prochaine course depuis cette liste.";
    if (pathname.startsWith("/livreur/en-cours")) return "Validez chaque étape de votre livraison en cours.";
    if (pathname.startsWith("/livreur/historique")) return "Toutes vos livraisons terminées et leurs gains.";
    if (pathname.startsWith("/livreur/portefeuille")) return "Suivi de vos gains et retraits disponibles.";
    if (pathname.startsWith("/livreur/notes")) return "Les évaluations laissées par vos clients.";
    if (pathname.startsWith("/livreur/profil")) return "Gérez vos informations et votre disponibilité.";
    return "Voici un aperçu de votre activité aujourd'hui.";
  })();

  return (
    <div className="min-h-screen bg-[#f3f2ee] text-slate-900">
      {mobileNavOpen ? (
        <button
          type="button"
          aria-label="Fermer le menu"
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-[252px] flex-col border-r border-slate-200/80 bg-white px-4 py-5 shadow-[4px_0_24px_rgba(0,0,0,0.04)] lg:flex lg:flex-col">
        <SidebarBody
          pathname={pathname}
          driverFullName={driverFullName}
          avatarUrl={avatarUrl}
          isAvailable={isAvailable}
          approved={approved}
        />
      </aside>

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[min(88vw,280px)] max-w-full flex-col border-r border-slate-200/80 bg-white px-4 py-5 shadow-xl transition-transform duration-300 ease-out lg:hidden ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Menu</span>
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <SidebarBody
          pathname={pathname}
          driverFullName={driverFullName}
          avatarUrl={avatarUrl}
          isAvailable={isAvailable}
          approved={approved}
          onCloseMobile={() => setMobileNavOpen(false)}
        />
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-[252px]">
        <LivreurTopBar
          driverFullName={driverFullName}
          avatarUrl={avatarUrl}
          isAvailable={isAvailable}
          approved={approved}
          unreadNotifications={unreadNotifications}
          notifications={notifications}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />

        <div className="flex-1 px-3 py-3 sm:px-4 sm:py-4">
          <div className="mx-auto max-w-[1600px]">
            <div className="mb-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-sm sm:px-5 sm:py-5">
              <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                {heading}
              </h1>
              <p className="mt-1 text-sm text-slate-500">{subheading}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
