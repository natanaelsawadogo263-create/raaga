"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import { deleteProductAction } from "@/app/admin/actions/products";

type Props = {
  productId: string;
  productName: string;
  /** Page liste produits : erreurs renvoyées vers /admin/produits */
  fromList?: boolean;
};

/**
 * Soumission directe vers `deleteProductAction`.
 * Le champ caché `confirm_text=SUPPRIMER` satisfait la garde côté serveur.
 */
export function AdminProductDeleteForm({ productId, productName, fromList }: Props) {
  return (
    <div className="rounded-2xl border border-rose-200/80 bg-rose-50/40 p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700 ring-1 ring-rose-200">
          <AlertTriangle className="h-5 w-5" strokeWidth={2} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-black text-rose-900">Zone dangereuse</h2>
          <p className="mt-1 text-xs text-rose-800/90">
            Suppression définitive de « <span className="font-semibold">{productName}</span> » : fiche,
            images, paniers et favoris associés. Les lignes de commande passées conservent le nom du
            produit mais ne pointent plus vers cette fiche.
          </p>
        </div>
      </div>
      <form action={deleteProductAction} className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input type="hidden" name="id" value={productId} />
        <input type="hidden" name="confirm_text" value="SUPPRIMER" />
        {fromList ? <input type="hidden" name="from" value="list" /> : null}
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-rose-500/25 transition hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40"
        >
          <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden />
          Supprimer définitivement le produit
        </button>
      </form>
    </div>
  );
}
