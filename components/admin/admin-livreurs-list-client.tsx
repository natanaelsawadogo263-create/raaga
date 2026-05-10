"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Mail,
  MailCheck,
  MapPin,
  Phone,
  Power,
  Search,
  Star,
  User,
  Wallet,
} from "lucide-react";
import { setDriverAvailableAction } from "@/app/admin/actions/drivers";
import { AdminDriverRowActions } from "@/components/admin/admin-driver-row-actions";
import { useAdminUi } from "@/components/admin/admin-ui-context";
import type { AdminDriverListRow } from "@/lib/admin/data";
import { formatCFA, formatOrderDate } from "@/lib/admin/format";

type Tab = "all" | "pending" | "approved" | "rejected" | "inactive";

const TAB_BAR_TONE: Record<
  Tab,
  { active: string; idle: string; dot: string }
> = {
  all: {
    active: "bg-slate-900 text-white shadow-sm",
    idle: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    dot: "bg-slate-400",
  },
  pending: {
    active: "bg-amber-500 text-white shadow-sm",
    idle: "bg-amber-50 text-amber-800 hover:bg-amber-100",
    dot: "bg-amber-500",
  },
  approved: {
    active: "bg-emerald-600 text-white shadow-sm",
    idle: "bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
    dot: "bg-emerald-500",
  },
  rejected: {
    active: "bg-rose-600 text-white shadow-sm",
    idle: "bg-rose-50 text-rose-800 hover:bg-rose-100",
    dot: "bg-rose-500",
  },
  inactive: {
    active: "bg-slate-700 text-white shadow-sm",
    idle: "bg-slate-50 text-slate-700 hover:bg-slate-100",
    dot: "bg-slate-400",
  },
};

function matches(q: string, ...parts: string[]) {
  const n = q.trim().toLowerCase();
  if (!n) return true;
  return parts.some((p) => String(p).toLowerCase().includes(n));
}

function displayName(d: AdminDriverListRow) {
  return `${d.first_name} ${d.last_name}`.trim();
}

function reviewLabel(s: AdminDriverListRow["review_status"]) {
  if (s === "pending") return "En attente";
  if (s === "approved") return "Approuvé";
  return "Refusé";
}

function reviewBadgeClass(s: AdminDriverListRow["review_status"]) {
  if (s === "pending") return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
  if (s === "approved") return "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200";
  return "bg-rose-50 text-rose-800 ring-1 ring-rose-200";
}

function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function AdminLivreursListClient({ drivers }: { drivers: AdminDriverListRow[] }) {
  const { searchQuery } = useAdminUi();
  const [tab, setTab] = useState<Tab>("all");
  const [localQuery, setLocalQuery] = useState("");

  const effectiveQuery = (searchQuery?.trim() ? searchQuery : localQuery).trim();

  const filtered = useMemo(() => {
    return drivers.filter((d) => {
      if (tab === "pending" && d.review_status !== "pending") return false;
      if (tab === "approved" && d.review_status !== "approved") return false;
      if (tab === "rejected" && d.review_status !== "rejected") return false;
      if (tab === "inactive" && d.profile_is_active) return false;
      return matches(
        effectiveQuery,
        displayName(d),
        d.phone,
        d.city,
        d.district,
        d.user_id,
        reviewLabel(d.review_status),
      );
    });
  }, [drivers, tab, effectiveQuery]);

  const counts = useMemo(() => {
    const p = drivers.filter((d) => d.review_status === "pending").length;
    const a = drivers.filter((d) => d.review_status === "approved").length;
    const r = drivers.filter((d) => d.review_status === "rejected").length;
    const inactive = drivers.filter((d) => !d.profile_is_active).length;
    return { all: drivers.length, pending: p, approved: a, rejected: r, inactive };
  }, [drivers]);

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "all", label: "Tous", count: counts.all },
    { id: "pending", label: "En attente", count: counts.pending },
    { id: "approved", label: "Approuvés", count: counts.approved },
    { id: "rejected", label: "Refusés", count: counts.rejected },
    { id: "inactive", label: "Désactivés", count: counts.inactive },
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <header className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5">
        <div className="min-w-0">
          <h2 className="text-sm font-black text-slate-900 sm:text-base">
            Liste des livreurs{" "}
            <span className="font-black text-[#FF7A00]">({filtered.length})</span>
          </h2>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Filtrez par statut et recherchez par nom, téléphone, ville ou identifiant.
          </p>
        </div>
        <div className="relative min-w-0 sm:w-72">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            strokeWidth={2}
            aria-hidden
          />
          <input
            type="search"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Nom, téléphone, ville…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#FF7A00] focus:bg-white focus:ring-2 focus:ring-[#FF7A00]/20"
            aria-label="Rechercher un livreur"
          />
        </div>
      </header>

      <div className="flex flex-wrap gap-2 border-b border-slate-100 bg-slate-50/40 px-4 py-3 sm:px-5">
        {tabs.map((t) => {
          const tone = TAB_BAR_TONE[t.id];
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                isActive ? tone.active : tone.idle
              }`}
              aria-pressed={isActive}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isActive ? "bg-white/80" : tone.dot
                }`}
                aria-hidden
              />
              {t.label}
              <span
                className={`tabular-nums ${
                  isActive ? "text-white/85" : "text-slate-500"
                }`}
              >
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <User className="h-6 w-6" strokeWidth={1.5} aria-hidden />
          </span>
          <p className="mt-3 text-sm font-bold text-slate-800">
            {drivers.length === 0 ? "Aucun livreur enregistré" : "Aucun résultat dans cet onglet"}
          </p>
          <p className="mt-1 max-w-md text-xs text-slate-500">
            {drivers.length === 0
              ? "Les nouveaux livreurs apparaîtront ici dès leur inscription."
              : effectiveQuery
                ? `Aucun livreur ne correspond à « ${effectiveQuery} ».`
                : "Essayez un autre filtre ou repassez sur l'onglet « Tous »."}
          </p>
        </div>
      ) : (
        <>
          {/* Vue table : md et + */}
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/60 text-[10.5px] font-black uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3">Livreur</th>
                  <th className="px-3 py-3">Contact</th>
                  <th className="px-3 py-3">Localisation</th>
                  <th className="px-3 py-3">Validation</th>
                  <th className="px-3 py-3">Compte</th>
                  <th className="px-3 py-3">Disponibilité</th>
                  <th className="px-3 py-3">Portefeuille</th>
                  <th className="px-3 py-3">Inscription</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => {
                  const name = displayName(d);
                  const isOnline =
                    d.is_available && d.profile_is_active && d.review_status === "approved";
                  return (
                    <tr
                      key={d.user_id}
                      className="border-b border-slate-100 transition hover:bg-orange-50/40"
                    >
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/admin/livreurs/${d.user_id}`}
                          className="group flex items-center gap-3"
                          title={`Fiche de ${name}`}
                        >
                          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
                            {d.avatar_url ? (
                              <Image
                                src={d.avatar_url}
                                alt=""
                                fill
                                sizes="44px"
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <span className="text-xs font-black text-slate-500">
                                {initials(name) || <User className="h-4 w-4" aria-hidden />}
                              </span>
                            )}
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-white ${
                                isOnline ? "bg-emerald-500" : "bg-slate-300"
                              }`}
                              aria-label={isOnline ? "En ligne" : "Hors ligne"}
                              title={isOnline ? "En ligne" : "Hors ligne"}
                            />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-black text-slate-900 group-hover:text-[#FF7A00]">
                              {name || "—"}
                            </span>
                            <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                              <Star
                                className="h-3 w-3 fill-amber-400 text-amber-400"
                                aria-hidden
                              />
                              {d.average_rating != null
                                ? Number(d.average_rating).toFixed(1)
                                : "—"}
                            </span>
                          </span>
                        </Link>
                      </td>

                      <td className="px-3 py-3.5">
                        <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                          <Phone
                            className="h-3.5 w-3.5 text-slate-400"
                            strokeWidth={2}
                            aria-hidden
                          />
                          {d.phone || "—"}
                        </p>
                        <p
                          className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            d.email_verified
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                              : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                          }`}
                        >
                          {d.email_verified ? (
                            <MailCheck className="h-3 w-3" strokeWidth={2} aria-hidden />
                          ) : (
                            <Mail className="h-3 w-3" strokeWidth={2} aria-hidden />
                          )}
                          {d.email_verified ? "E-mail vérifié" : "E-mail non vérifié"}
                        </p>
                      </td>

                      <td className="px-3 py-3.5">
                        <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                          <MapPin
                            className="h-3.5 w-3.5 text-slate-400"
                            strokeWidth={2}
                            aria-hidden
                          />
                          {d.city || "—"}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-slate-500">
                          {[d.district, d.sector].filter(Boolean).join(" · ") || "—"}
                        </p>
                      </td>

                      <td className="px-3 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${reviewBadgeClass(
                            d.review_status,
                          )}`}
                        >
                          {reviewLabel(d.review_status)}
                        </span>
                      </td>

                      <td className="px-3 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            d.profile_is_active
                              ? "bg-sky-50 text-sky-800 ring-1 ring-sky-200"
                              : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                          }`}
                        >
                          <Power className="h-3 w-3" strokeWidth={2} aria-hidden />
                          {d.profile_is_active ? "Actif" : "Désactivé"}
                        </span>
                      </td>

                      <td className="px-3 py-3.5">
                        {d.review_status === "approved" && d.profile_is_active ? (
                          <form
                            action={setDriverAvailableAction}
                            className="inline-flex items-center gap-2"
                          >
                            <input type="hidden" name="user_id" value={d.user_id} />
                            <input
                              type="hidden"
                              name="return_path"
                              value="/admin/livreurs"
                            />
                            <input
                              type="hidden"
                              name="is_available"
                              value={d.is_available ? "false" : "true"}
                            />
                            <button
                              type="submit"
                              role="switch"
                              aria-checked={d.is_available}
                              title={
                                d.is_available
                                  ? "Forcer hors ligne"
                                  : "Marquer comme disponible"
                              }
                              className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition ${
                                d.is_available ? "bg-emerald-500" : "bg-slate-300"
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
                                  d.is_available ? "translate-x-4" : "translate-x-0.5"
                                }`}
                              />
                            </button>
                            <span
                              className={`text-[11px] font-bold ${
                                d.is_available ? "text-emerald-700" : "text-slate-500"
                              }`}
                            >
                              {d.is_available ? "En ligne" : "Hors ligne"}
                            </span>
                          </form>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>

                      <td className="px-3 py-3.5">
                        <p className="inline-flex items-center gap-1.5 text-sm font-black tabular-nums text-slate-900">
                          <Wallet
                            className="h-3.5 w-3.5 text-[#FF7A00]"
                            strokeWidth={2}
                            aria-hidden
                          />
                          {formatCFA(d.wallet_balance_cfa)}
                        </p>
                        {d.wallet_pending_cfa > 0 ? (
                          <p className="mt-0.5 text-[10px] font-semibold text-amber-700">
                            {formatCFA(d.wallet_pending_cfa)} en attente
                          </p>
                        ) : null}
                      </td>

                      <td className="px-3 py-3.5 text-xs font-semibold text-slate-600">
                        {formatOrderDate(d.created_at)}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <AdminDriverRowActions
                          userId={d.user_id}
                          name={name}
                          reviewStatus={d.review_status}
                          profileIsActive={d.profile_is_active}
                          returnPath="/admin/livreurs"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Vue cartes : mobile */}
          <ul className="divide-y divide-slate-100 md:hidden">
            {filtered.map((d) => {
              const name = displayName(d);
              const isOnline =
                d.is_available && d.profile_is_active && d.review_status === "approved";
              return (
                <li key={d.user_id} className="px-4 py-4">
                  <div className="flex items-start gap-3">
                    <Link
                      href={`/admin/livreurs/${d.user_id}`}
                      className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200"
                      title={`Fiche de ${name}`}
                    >
                      {d.avatar_url ? (
                        <Image
                          src={d.avatar_url}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <span className="text-sm font-black text-slate-500">
                          {initials(name) || <User className="h-5 w-5" aria-hidden />}
                        </span>
                      )}
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-white ${
                          isOnline ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                        aria-hidden
                      />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/livreurs/${d.user_id}`}
                          className="block truncate text-sm font-black text-slate-900 hover:text-[#FF7A00]"
                        >
                          {name || "—"}
                        </Link>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${reviewBadgeClass(
                            d.review_status,
                          )}`}
                        >
                          {reviewLabel(d.review_status)}
                        </span>
                      </div>
                      <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                        <Star
                          className="h-3 w-3 fill-amber-400 text-amber-400"
                          aria-hidden
                        />
                        {d.average_rating != null
                          ? Number(d.average_rating).toFixed(1)
                          : "—"}{" "}
                        · Inscrit le {formatOrderDate(d.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-2">
                      <p className="font-bold uppercase tracking-wide text-slate-500">
                        Contact
                      </p>
                      <p className="mt-1 inline-flex items-center gap-1 font-semibold text-slate-800">
                        <Phone className="h-3 w-3 text-slate-400" aria-hidden />
                        {d.phone || "—"}
                      </p>
                      <p
                        className={`mt-0.5 ${
                          d.email_verified ? "text-emerald-700" : "text-amber-700"
                        }`}
                      >
                        {d.email_verified ? "E-mail vérifié" : "E-mail non vérifié"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-2">
                      <p className="font-bold uppercase tracking-wide text-slate-500">
                        Localisation
                      </p>
                      <p className="mt-1 inline-flex items-center gap-1 font-semibold text-slate-800">
                        <MapPin className="h-3 w-3 text-slate-400" aria-hidden />
                        {d.city || "—"}
                      </p>
                      <p className="mt-0.5 truncate text-slate-500">
                        {[d.district, d.sector].filter(Boolean).join(" · ") || "—"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-2">
                      <p className="font-bold uppercase tracking-wide text-slate-500">
                        Compte
                      </p>
                      <p className="mt-1 inline-flex items-center gap-1 font-semibold text-slate-800">
                        <Power className="h-3 w-3 text-slate-400" aria-hidden />
                        {d.profile_is_active ? "Actif" : "Désactivé"}
                      </p>
                      {d.review_status === "approved" && d.profile_is_active ? (
                        <form
                          action={setDriverAvailableAction}
                          className="mt-1 inline-flex items-center gap-2"
                        >
                          <input type="hidden" name="user_id" value={d.user_id} />
                          <input
                            type="hidden"
                            name="return_path"
                            value="/admin/livreurs"
                          />
                          <input
                            type="hidden"
                            name="is_available"
                            value={d.is_available ? "false" : "true"}
                          />
                          <button
                            type="submit"
                            role="switch"
                            aria-checked={d.is_available}
                            className={`relative inline-flex h-4 w-8 items-center rounded-full transition ${
                              d.is_available ? "bg-emerald-500" : "bg-slate-300"
                            }`}
                          >
                            <span
                              className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition ${
                                d.is_available ? "translate-x-4" : "translate-x-0.5"
                              }`}
                            />
                          </button>
                          <span
                            className={`font-bold ${
                              d.is_available ? "text-emerald-700" : "text-slate-500"
                            }`}
                          >
                            {d.is_available ? "En ligne" : "Hors ligne"}
                          </span>
                        </form>
                      ) : null}
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-2">
                      <p className="font-bold uppercase tracking-wide text-slate-500">
                        Portefeuille
                      </p>
                      <p className="mt-1 inline-flex items-center gap-1 font-black tabular-nums text-slate-900">
                        <Wallet className="h-3 w-3 text-[#FF7A00]" aria-hidden />
                        {formatCFA(d.wallet_balance_cfa)}
                      </p>
                      {d.wallet_pending_cfa > 0 ? (
                        <p className="mt-0.5 text-amber-700">
                          {formatCFA(d.wallet_pending_cfa)} en attente
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <AdminDriverRowActions
                      userId={d.user_id}
                      name={name}
                      reviewStatus={d.review_status}
                      profileIsActive={d.profile_is_active}
                      returnPath="/admin/livreurs"
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
