"use client";

import { useMemo } from "react";
import { ImageIcon, Tags } from "lucide-react";
import { AdminCategoryRowActions } from "@/components/admin/admin-category-row-actions";
import { useAdminUi } from "@/components/admin/admin-ui-context";
import type { AdminCategoryRow } from "@/lib/admin/data";

function matches(q: string, ...parts: string[]) {
  const n = q.trim().toLowerCase();
  if (!n) return true;
  return parts.some((p) => p.toLowerCase().includes(n));
}

export function AdminCategoriesListClient({ categories }: { categories: AdminCategoryRow[] }) {
  const { searchQuery } = useAdminUi();

  const filtered = useMemo(
    () =>
      categories.filter((c) =>
        matches(searchQuery, c.name, c.slug, c.description ?? "", c.is_active ? "actif" : "inactif"),
      ),
    [categories, searchQuery],
  );

  if (filtered.length === 0) {
    return (
      <div className="px-6 py-14 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Tags className="h-6 w-6" strokeWidth={1.75} aria-hidden />
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-800">
          {categories.length === 0 ? "Aucune catégorie" : `Aucun résultat pour « ${searchQuery} »`}
        </p>
        <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
          {categories.length === 0
            ? "Ajoutez une catégorie pour organiser vos produits et le catalogue."
            : "Modifiez votre recherche dans la barre du haut."}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto px-3 pb-4 pt-2 sm:px-5 sm:pb-5 sm:pt-3">
      <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left [&_td]:align-middle [&_th]:whitespace-nowrap">
        <thead>
          <tr className="bg-slate-50/95">
            <th
              scope="col"
              className="border-b border-slate-200 px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600 sm:px-5"
            >
              Visuel
            </th>
            <th
              scope="col"
              className="border-b border-slate-200 px-3 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600"
            >
              Nom
            </th>
            <th
              scope="col"
              className="border-b border-slate-200 px-3 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600"
            >
              Slug URL
            </th>
            <th
              scope="col"
              className="border-b border-slate-200 px-3 py-3.5 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600"
            >
              Ordre
            </th>
            <th
              scope="col"
              className="border-b border-slate-200 px-3 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600"
            >
              État
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
          {filtered.map((c, index) => {
            const isDefault = c.slug === "autres";
            const desc = c.description?.trim();

            return (
              <tr
                key={c.id}
                className={`group transition-colors ${index % 2 === 0 ? "bg-white" : "bg-slate-50/50"} hover:bg-orange-50/35`}
              >
                <td className="border-b border-slate-100 px-4 py-4 whitespace-nowrap sm:px-5">
                  <div className="relative h-[3.25rem] w-[4.75rem] shrink-0 overflow-hidden rounded-xl bg-slate-100 shadow-sm ring-1 ring-slate-200/80">
                    {c.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.image_url} alt="" className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]" />
                    ) : (
                      <div
                        className="flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-slate-50 to-slate-100 text-slate-400"
                        title="Aucune image"
                      >
                        <ImageIcon className="h-5 w-5 opacity-55" strokeWidth={1.5} aria-hidden />
                      </div>
                    )}
                  </div>
                </td>
                <td className="max-w-[min(320px,40vw)] border-b border-slate-100 px-3 py-4 whitespace-nowrap">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="min-w-0 truncate text-[15px] font-bold text-slate-900" title={desc ? `${c.name} — ${desc}` : c.name}>
                      {c.name}
                    </span>
                    {isDefault ? (
                      <span className="shrink-0 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900 ring-1 ring-amber-200/90">
                        Défaut
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="max-w-[200px] border-b border-slate-100 px-3 py-4 whitespace-nowrap">
                  <code className="inline-block max-w-full truncate rounded-lg bg-slate-100/90 px-2.5 py-1.5 font-mono text-[12px] font-medium text-slate-700 ring-1 ring-slate-200/90">
                    {c.slug}
                  </code>
                </td>
                <td className="border-b border-slate-100 px-3 py-4 text-center whitespace-nowrap">
                  <span className="inline-flex min-h-[1.75rem] min-w-[2.25rem] items-center justify-center rounded-lg bg-white px-2.5 py-1 text-sm font-bold tabular-nums text-slate-800 shadow-sm ring-1 ring-slate-200/90">
                    {c.sort_order}
                  </span>
                </td>
                <td className="border-b border-slate-100 px-3 py-4 whitespace-nowrap">
                  {c.is_active ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-900 ring-1 ring-emerald-200/70">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500 ring-2 ring-emerald-200/80" aria-hidden />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200/80">
                      <span className="h-2 w-2 rounded-full bg-slate-400" aria-hidden />
                      Inactive
                    </span>
                  )}
                </td>
                <td className="border-b border-slate-100 px-4 py-4 text-right whitespace-nowrap sm:px-5">
                  <div className="flex justify-end">
                    <AdminCategoryRowActions categoryId={c.id} categoryName={c.name} slug={c.slug} />
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
