"use client";

import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { deleteCategoryAction } from "@/app/admin/actions/categories";
import { adminCrudIconBtn, adminCrudIconBtnDanger } from "@/components/admin/admin-crud-icon-classes";

type Props = {
  categoryId: string;
  categoryName: string;
  slug: string;
};

export function AdminCategoryRowActions({ categoryId, categoryName, slug }: Props) {
  const isSystemDefault = slug === "autres";
  const catalogueHref = `/produits?q=${encodeURIComponent(categoryName)}`;

  return (
    <div className="flex flex-nowrap items-center justify-end gap-1">
      <Link
        href={catalogueHref}
        className={adminCrudIconBtn}
        title="Voir dans le catalogue"
        aria-label="Voir les produits de cette catégorie sur le catalogue"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Eye className="h-4 w-4" strokeWidth={2} aria-hidden />
      </Link>
      <Link href={`/admin/categories/${categoryId}`} className={adminCrudIconBtn} title="Modifier" aria-label="Modifier la catégorie">
        <Pencil className="h-4 w-4" strokeWidth={2} aria-hidden />
      </Link>
      {isSystemDefault ? (
        <span
          className={`${adminCrudIconBtn} cursor-not-allowed opacity-40 hover:border-slate-200 hover:bg-white hover:text-slate-600`}
          title="Catégorie système — non supprimable"
          aria-label="Catégorie système — suppression impossible"
        >
          <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden />
        </span>
      ) : (
        <form
          action={deleteCategoryAction}
          className="inline"
          onSubmit={(e) => {
            if (
              !confirm(
                `Supprimer la catégorie « ${categoryName} » ?\n\nLes produits seront rattachés à la catégorie « Autres ».`,
              )
            ) {
              e.preventDefault();
            }
          }}
        >
          <input type="hidden" name="id" value={categoryId} />
          <button type="submit" className={adminCrudIconBtnDanger} title="Supprimer" aria-label="Supprimer la catégorie">
            <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden />
          </button>
        </form>
      )}
    </div>
  );
}
