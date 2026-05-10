"use client";

import { useMemo } from "react";
import { Store } from "lucide-react";
import { AdminShopRowActions } from "@/components/admin/admin-shop-row-actions";
import { useAdminUi } from "@/components/admin/admin-ui-context";
import type { AdminShopListRow } from "@/lib/admin/data";
import type { Database } from "@/lib/supabase/database.types";

type ShopStatus = Database["public"]["Tables"]["shops"]["Row"]["status"];

const STATUS_LABELS: Record<ShopStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  suspended: "Suspendue",
  pending: "En attente",
};

const STATUS_BADGE: Record<ShopStatus, string> = {
  active: "bg-emerald-50 text-emerald-800 ring-emerald-200/80",
  pending: "bg-amber-50 text-amber-900 ring-amber-200/70",
  inactive: "bg-slate-100 text-slate-700 ring-slate-200/80",
  suspended: "bg-rose-50 text-rose-800 ring-rose-200/70",
};

function matches(q: string, ...parts: string[]) {
  const n = q.trim().toLowerCase();
  if (!n) return true;
  return parts.some((p) => p.toLowerCase().includes(n));
}

function formatDateShort(iso: string) {
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function telHref(phone: string) {
  const digits = phone.replace(/\s/g, "");
  return digits ? `tel:${digits}` : undefined;
}

export function AdminShopsListClient({ shops }: { shops: AdminShopListRow[] }) {
  const { searchQuery } = useAdminUi();

  const filtered = useMemo(
    () =>
      shops.filter((s) =>
        matches(
          searchQuery,
          s.id,
          s.name,
          s.city,
          s.district,
          s.sector,
          s.address,
          s.phone,
          s.description ?? "",
          s.manager_name ?? "",
          STATUS_LABELS[s.status],
          s.owner_user_id ?? "",
        ),
      ),
    [shops, searchQuery],
  );

  if (filtered.length === 0) {
    return (
      <div className="px-4 py-12 text-center sm:px-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Store className="h-6 w-6" strokeWidth={1.75} aria-hidden />
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-800">
          {shops.length === 0 ? "Aucune boutique pour l'instant" : `Aucun résultat pour « ${searchQuery} »`}
        </p>
        <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
          {shops.length === 0
            ? "Ajoutez une fiche boutique pour rattacher vos produits à une enseigne."
            : "Affinez la recherche dans la barre du haut."}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto px-3 pb-4 pt-2 sm:px-5 sm:pb-5 sm:pt-3">
      <table className="w-full min-w-[980px] border-separate border-spacing-0 text-left [&_td]:align-middle [&_th]:whitespace-nowrap">
        <thead>
          <tr className="bg-slate-50/95">
            <th
              scope="col"
              className="border-b border-slate-200 px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600 sm:px-5"
            >
              Boutique
            </th>
            <th
              scope="col"
              className="border-b border-slate-200 px-3 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600"
            >
              Adresse
            </th>
            <th
              scope="col"
              className="border-b border-slate-200 px-3 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600"
            >
              Localisation
            </th>
            <th
              scope="col"
              className="border-b border-slate-200 px-3 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600"
            >
              Téléphone
            </th>
            <th
              scope="col"
              className="border-b border-slate-200 px-3 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600"
            >
              Gérant
            </th>
            <th
              scope="col"
              className="border-b border-slate-200 px-3 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600"
            >
              Statut
            </th>
            <th
              scope="col"
              className="border-b border-slate-200 px-3 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600 whitespace-nowrap"
            >
              Mise à jour
            </th>
            <th
              scope="col"
              className="border-b border-slate-200 px-4 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600 sm:px-5"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((s, index) => {
            const phoneLink = telHref(s.phone);
            const locationParts = [s.city, s.district, s.sector].filter((x) => (x ?? "").trim() !== "");
            const locationLine = locationParts.length ? locationParts.join(" · ") : "—";

            return (
              <tr
                key={s.id}
                className={`group transition-colors ${index % 2 === 0 ? "bg-white" : "bg-slate-50/50"} hover:bg-orange-50/35`}
              >
                <td className="max-w-[min(280px,28vw)] border-b border-slate-100 px-4 py-3.5 whitespace-nowrap sm:px-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#FF7A00] shadow-sm ring-1 ring-orange-100/80">
                      <Store className="h-5 w-5" strokeWidth={2} aria-hidden />
                    </span>
                    <p
                      className="min-w-0 truncate text-[15px] font-bold text-slate-900"
                      title={`${s.name} — ${s.id}`}
                    >
                      {s.name}{" "}
                      <span className="font-mono text-[11px] font-normal text-slate-400">
                        · {s.id.slice(0, 8)}…
                      </span>
                    </p>
                  </div>
                </td>
                <td className="max-w-[220px] border-b border-slate-100 px-3 py-3.5 whitespace-nowrap">
                  <span className="block truncate text-sm text-slate-700" title={s.address || undefined}>
                    {s.address || "—"}
                  </span>
                </td>
                <td className="max-w-[200px] border-b border-slate-100 px-3 py-3.5 whitespace-nowrap">
                  <span className="block truncate text-sm text-slate-600" title={locationLine}>
                    {locationLine}
                  </span>
                </td>
                <td className="border-b border-slate-100 px-3 py-3.5 whitespace-nowrap">
                  {phoneLink ? (
                    <a
                      href={phoneLink}
                      className="inline-block max-w-[140px] truncate font-mono text-sm tabular-nums text-[#FF7A00] underline decoration-[#FF7A00]/35 underline-offset-2 hover:text-orange-600"
                      title={s.phone}
                    >
                      {s.phone}
                    </a>
                  ) : (
                    <span className="inline-block max-w-[140px] truncate font-mono text-sm tabular-nums text-slate-500" title={s.phone}>
                      {s.phone}
                    </span>
                  )}
                </td>
                <td className="max-w-[160px] border-b border-slate-100 px-3 py-3.5 whitespace-nowrap">
                  <span className="block truncate text-sm text-slate-800" title={s.manager_name?.trim() || undefined}>
                    {s.manager_name?.trim() || "—"}
                  </span>
                </td>
                <td className="border-b border-slate-100 px-3 py-3.5 whitespace-nowrap">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ring-inset ${STATUS_BADGE[s.status]}`}
                  >
                    {STATUS_LABELS[s.status]}
                  </span>
                </td>
                <td className="border-b border-slate-100 px-3 py-3.5 whitespace-nowrap text-xs text-slate-600">
                  {formatDateShort(s.updated_at)}
                </td>
                <td className="border-b border-slate-100 px-4 py-3.5 text-right whitespace-nowrap sm:px-5">
                  <div className="flex flex-nowrap justify-end">
                    <AdminShopRowActions shopId={s.id} shopName={s.name} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
