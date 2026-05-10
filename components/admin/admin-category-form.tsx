import Link from "next/link";
import { createCategoryAction, deleteCategoryAction, updateCategoryAction } from "@/app/admin/actions/categories";
import type { AdminCategoryRow } from "@/lib/admin/data";

function fieldClass() {
  return "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20";
}

function labelClass() {
  return "block text-xs font-bold text-slate-700";
}

export function AdminCategoryForm({
  category,
  mode,
  flash,
}: {
  category?: AdminCategoryRow;
  mode: "create" | "edit";
  flash?: { ok?: string; error?: string };
}) {
  const isEdit = mode === "edit" && category;

  return (
    <div className="space-y-6">
      {flash?.error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{flash.error}</div>
      ) : null}
      {flash?.ok ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{flash.ok}</div>
      ) : null}

      <form action={isEdit ? updateCategoryAction : createCategoryAction} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        {isEdit ? <input type="hidden" name="id" value={category.id} /> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass()} htmlFor="name">
              Nom
            </label>
            <input id="name" name="name" required className={fieldClass()} defaultValue={category?.name ?? ""} />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass()} htmlFor="slug">
              Slug URL
            </label>
            <input
              id="slug"
              name="slug"
              className={fieldClass()}
              placeholder="ex. chaussures"
              defaultValue={category?.slug ?? ""}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass()} htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className={fieldClass()}
              defaultValue={category?.description ?? ""}
            />
          </div>

          <div>
            <label className={labelClass()} htmlFor="sort_order">
              Ordre d’affichage
            </label>
            <input
              id="sort_order"
              name="sort_order"
              type="number"
              className={fieldClass()}
              defaultValue={category?.sort_order ?? 0}
            />
          </div>

          <div className="flex items-end gap-2 pb-1">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-800">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={category?.is_active ?? true}
                className="h-4 w-4 rounded border-slate-300 text-[#FF7A00]"
              />
              Catégorie active
            </label>
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass()} htmlFor="cover">
              Image de couverture
            </label>
            {category?.image_url ? (
              <div className="mt-2 flex flex-wrap items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={category.image_url} alt="" className="h-24 w-36 rounded-lg object-cover ring-1 ring-slate-200" />
                <label className="flex items-center gap-2 text-xs font-semibold text-rose-700">
                  <input type="checkbox" name="remove_image" className="h-4 w-4 rounded border-slate-300" />
                  Supprimer l’image actuelle
                </label>
              </div>
            ) : null}
            <input
              id="cover"
              name="cover"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="mt-2 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[#FF7A00]"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="submit"
            className="rounded-xl bg-[#FF7A00] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#e66e00]"
          >
            {isEdit ? "Enregistrer" : "Créer la catégorie"}
          </button>
          <Link
            href="/admin/categories"
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Annuler
          </Link>
        </div>
      </form>

      {isEdit && category?.slug !== "autres" ? (
        <div className="rounded-2xl border border-rose-200/80 bg-rose-50/50 p-5 shadow-sm">
          <form action={deleteCategoryAction}>
            <input type="hidden" name="id" value={category.id} />
            <button
              type="submit"
              className="rounded-xl border border-rose-300 bg-white px-4 py-2 text-sm font-bold text-rose-700 hover:bg-rose-50"
            >
              Supprimer la catégorie
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
