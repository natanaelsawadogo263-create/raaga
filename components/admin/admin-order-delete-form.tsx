"use client";

import { Trash2 } from "lucide-react";
import { deleteOrderAdminAction } from "@/app/admin/actions/orders";

type Props = {
  orderId: string;
};

/**
 * Soumission directe vers `deleteOrderAdminAction` (sans popup navigateur).
 * Le champ caché `confirm_text=SUPPRIMER` satisfait la garde côté serveur.
 */
export function AdminOrderDeleteForm({ orderId }: Props) {
  return (
    <form action={deleteOrderAdminAction} className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input type="hidden" name="order_id" value={orderId} />
      <input type="hidden" name="confirm_text" value="SUPPRIMER" />
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-rose-500/25 transition hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40"
      >
        <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden />
        Supprimer définitivement la commande
      </button>
    </form>
  );
}
