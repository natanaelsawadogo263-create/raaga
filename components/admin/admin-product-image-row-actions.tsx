"use client";

import { Star, Trash2 } from "lucide-react";
import { deleteProductImageAction, setPrimaryProductImageAction } from "@/app/admin/actions/products";
import { adminCrudIconBtn, adminCrudIconBtnDanger } from "@/components/admin/admin-crud-icon-classes";

type Props = {
  imageId: string;
  productId: string;
  isPrimary: boolean;
};

export function AdminProductImageRowActions({ imageId, productId, isPrimary }: Props) {
  return (
    <div className="flex shrink-0 flex-wrap gap-1.5">
      {!isPrimary ? (
        <form action={setPrimaryProductImageAction} className="inline">
          <input type="hidden" name="id" value={imageId} />
          <input type="hidden" name="product_id" value={productId} />
          <button
            type="submit"
            className={adminCrudIconBtn}
            title="Définir comme image principale"
            aria-label="Définir comme image principale du catalogue"
          >
            <Star className="h-4 w-4" strokeWidth={2} aria-hidden />
          </button>
        </form>
      ) : null}
      <form
        action={deleteProductImageAction}
        className="inline"
        onSubmit={(e) => {
          if (!confirm("Retirer cette image du produit ?")) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="id" value={imageId} />
        <input type="hidden" name="product_id" value={productId} />
        <button
          type="submit"
          className={adminCrudIconBtnDanger}
          title="Retirer l’image"
          aria-label="Retirer cette image"
        >
          <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden />
        </button>
      </form>
    </div>
  );
}
