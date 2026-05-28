"use client";

import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { deleteProductAction } from "@/app/admin/actions/products";
import { adminCrudIconBtn, adminCrudIconBtnDanger } from "@/components/admin/admin-crud-icon-classes";

type AdminProductRowActionsProps = {
  productId: string;
  productName: string;
};

export function AdminProductRowActions({ productId, productName }: AdminProductRowActionsProps) {
  return (
    <div className="flex flex-nowrap items-center justify-end gap-1">
      <Link
        href={`/produits/${productId}`}
        className={adminCrudIconBtn}
        title="Voir la fiche publique"
        aria-label="Voir la fiche publique du produit"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Eye className="h-4 w-4" strokeWidth={2} aria-hidden />
      </Link>
      <Link
        href={`/admin/produits/${productId}`}
        className={adminCrudIconBtn}
        title="Modifier"
        aria-label="Modifier le produit"
      >
        <Pencil className="h-4 w-4" strokeWidth={2} aria-hidden />
      </Link>
      <form
        action={deleteProductAction}
        className="inline"
        onSubmit={(e) => {
          if (
            !confirm(
              `Supprimer définitivement « ${productName} » ?\n\nCette action est irréversible. Les commandes passées garderont le nom du produit.`,
            )
          ) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="id" value={productId} />
        <input type="hidden" name="confirm_text" value="SUPPRIMER" />
        <input type="hidden" name="from" value="list" />
        <button
          type="submit"
          className={adminCrudIconBtnDanger}
          title="Supprimer définitivement"
          aria-label="Supprimer définitivement le produit"
        >
          <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden />
        </button>
      </form>
    </div>
  );
}
