"use client";

import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { deleteShopAction } from "@/app/admin/actions/shops";
import { adminCrudIconBtn, adminCrudIconBtnDanger } from "@/components/admin/admin-crud-icon-classes";

type Props = {
  shopId: string;
  shopName: string;
};

export function AdminShopRowActions({ shopId, shopName }: Props) {
  return (
    <div className="flex shrink-0 flex-nowrap items-center justify-end gap-1">
      <Link
        href={`/admin/boutiques/${shopId}`}
        className={adminCrudIconBtn}
        title="Voir la fiche"
        aria-label="Voir la fiche boutique"
      >
        <Eye className="h-4 w-4" strokeWidth={2} aria-hidden />
      </Link>
      <Link href={`/admin/boutiques/${shopId}`} className={adminCrudIconBtn} title="Modifier" aria-label="Modifier la boutique">
        <Pencil className="h-4 w-4" strokeWidth={2} aria-hidden />
      </Link>
      <form
        action={deleteShopAction}
        className="inline"
        onSubmit={(e) => {
          if (
            !confirm(
              `Supprimer la boutique « ${shopName} » ?\n\nImpossible si des produits y sont encore rattachés — retirez-les ou réassignez-les d’abord.`,
            )
          ) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="id" value={shopId} />
        <button type="submit" className={adminCrudIconBtnDanger} title="Supprimer" aria-label="Supprimer la boutique">
          <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden />
        </button>
      </form>
    </div>
  );
}
