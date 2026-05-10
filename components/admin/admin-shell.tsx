"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  Heart,
  LogOut,
  Menu,
  Search,
  X,
} from "lucide-react";
import { signOutAction } from "@/app/actions";
import { adminNavItems, ShoppingBag } from "@/lib/admin-nav";
import { AdminUiProvider, useAdminUi } from "@/components/admin/admin-ui-context";

function navActive(pathname: string, href: string) {
  if (href === "#") return false;
  if (href === "/admin") return pathname === "/admin" || pathname === "/admin/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

type AdminShellProps = {
  adminName: string;
  adminFirstName: string;
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

function AdminTopBar({
  adminName,
  onOpenMobileNav,
}: {
  adminName: string;
  onOpenMobileNav?: () => void;
}) {
  const { searchQuery, setSearchQuery } = useAdminUi();
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [notifUnread, setNotifUnread] = useState(3);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const dateInputId = useId();
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  useOnOutsideClose(notifRef, notifOpen, () => setNotifOpen(false));
  useOnOutsideClose(userRef, userOpen, () => setUserOpen(false));

  const dateLabel = selectedDate.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const notifications = [
    { id: "1", text: "Nouvelle commande #RAA-8421 — 45 000 FCFA", time: "Il y a 12 min" },
    { id: "2", text: "Stock faible : Riz local 5 kg (Faso Market)", time: "Il y a 1 h" },
    { id: "3", text: "Demande livreur : Moussa Ouédraogo", time: "Il y a 2 h" },
  ];

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

        <div className="relative min-w-0 flex-1 basis-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un produit, une commande, un client..."
            className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#FF7A00] focus:bg-white focus:ring-2 focus:ring-[#FF7A00]/20"
            aria-label="Recherche dans le tableau de bord"
          />
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-1.5 sm:gap-2">
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
              </div>
            ) : null}
          </div>

          <div className="relative" ref={userRef}>
            <button
              type="button"
              onClick={() => setUserOpen((o) => !o)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 shadow-sm transition hover:bg-slate-50"
              aria-expanded={userOpen}
              aria-label="Menu compte"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-amber-100 text-xs font-black text-[#FF7A00] ring-1 ring-orange-200/60">
                {adminName.charAt(0).toUpperCase()}
              </span>
              <div className="hidden leading-tight sm:block">
                <p className="text-xs font-bold text-slate-900">{adminName}</p>
                <p className="text-[11px] text-slate-500">Administrateur</p>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
            </button>
            {userOpen ? (
              <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-2xl border border-slate-200 bg-white py-1 shadow-xl ring-1 ring-black/5">
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Déconnexion
                  </button>
                </form>
              </div>
            ) : null}
          </div>

          <input
            ref={dateInputRef}
            id={dateInputId}
            type="date"
            className="sr-only"
            value={selectedDate.toISOString().slice(0, 10)}
            onChange={(e) => {
              const v = e.target.value;
              if (v) setSelectedDate(new Date(v + "T12:00:00"));
            }}
          />
          <button
            type="button"
            onClick={() => dateInputRef.current?.showPicker?.() ?? dateInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 shadow-sm sm:text-sm"
          >
            <CalendarDays className="h-4 w-4 text-slate-500" />
            <span className="hidden sm:inline">{dateLabel}</span>
            <span className="sm:hidden">Date</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function SidebarBody({ pathname, onCloseMobile }: { pathname: string; onCloseMobile?: () => void }) {
  return (
    <>
      <div className="flex items-center gap-2.5 px-1">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-[#FF7A00] shadow-sm ring-1 ring-orange-200/50">
          <ShoppingBag className="h-5 w-5" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-black leading-none tracking-tight text-[#FF7A00]">Raaga</p>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Achetez local, faites livrer
          </p>
        </div>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-1">
        {adminNavItems.map((item) => {
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
          Raaga, la plateforme du commerce local au Burkina Faso
        </p>
        <Link
          href="/a-propos"
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/90 py-2.5 text-xs font-bold text-[#FF7A00] shadow-sm ring-1 ring-orange-200/60 transition hover:bg-white"
        >
          <Heart className="h-3.5 w-3.5 fill-[#FF7A00] text-[#FF7A00]" />
          Soutenir le local
        </Link>
      </div>
    </>
  );
}

function AdminMainColumn({
  adminName,
  adminFirstName,
  children,
  setMobileNavOpen,
}: {
  adminName: string;
  adminFirstName: string;
  children: React.ReactNode;
  setMobileNavOpen: (v: boolean) => void;
}) {
  return (
    <AdminUiProvider>
      <div className="flex min-h-screen flex-col lg:pl-[252px]">
        <AdminTopBar adminName={adminName} onOpenMobileNav={() => setMobileNavOpen(true)} />

        <div className="flex-1 px-3 py-3 sm:px-4 sm:py-4">
          <div className="mx-auto max-w-[1600px]">
            <div className="mb-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-sm sm:px-5 sm:py-5">
              <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                Bonjour {adminFirstName}, bienvenue sur Raaga 👋
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Voici un aperçu de l’activité de votre plateforme aujourd’hui.
              </p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </AdminUiProvider>
  );
}

export function AdminShell({ adminName, adminFirstName, children }: AdminShellProps) {
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
        <SidebarBody pathname={pathname} />
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
        <SidebarBody pathname={pathname} onCloseMobile={() => setMobileNavOpen(false)} />
      </aside>

      <AdminMainColumn
        adminName={adminName}
        adminFirstName={adminFirstName}
        setMobileNavOpen={setMobileNavOpen}
      >
        {children}
      </AdminMainColumn>
    </div>
  );
}
