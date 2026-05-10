"use client";

import { Trash2 } from "lucide-react";
import { removeOrderItemAdminAction } from "@/app/admin/actions/orders";
import { adminCrudIconBtnDanger } from "@/components/admin/admin-crud-icon-classes";

type Props = {
  itemId: string;
  orderId: string;
  productLabel: string;
};

export function AdminOrderItemRemoveForm({ itemId, orderId, productLabel }: Props) {
  return (
    <form
      action={removeOrderItemAdminAction}
      className="inline"
      onSubmit={(e) => {
        if (!confirm(`Retirer la ligne « ${productLabel} » de cette commande ?`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={itemId} />
      <input type="hidden" name="order_id" value={orderId} />
      <button
        type="submit"
        className={adminCrudIconBtnDanger}
        title="Retirer la ligne"
        aria-label="Retirer cette ligne de commande"
      >
        <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden />
      </button>
    </form>
  );
}
