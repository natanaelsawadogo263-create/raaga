"use client";

import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { deleteCustomerAction } from "@/app/admin/actions/customers";
import { adminCrudIconBtn, adminCrudIconBtnDanger } from "@/components/admin/admin-crud-icon-classes";

type Props = {
  customerId: string;
  displayName: string;
};

export function AdminCustomerRowActions({ customerId, displayName }: Props) {
  return (
    <div className="flex shrink-0 flex-nowrap items-center justify-end gap-1">
      <Link
        href={`/admin/clients/${customerId}`}
        className={adminCrudIconBtn}
        title="Voir la fiche"
        aria-label="Voir la fiche client"
      >
        <Eye className="h-4 w-4" strokeWidth={2} aria-hidden />
      </Link>
      <Link
        href={`/admin/clients/${customerId}`}
        className={adminCrudIconBtn}
        title="Modifier"
        aria-label="Modifier le client"
      >
        <Pencil className="h-4 w-4" strokeWidth={2} aria-hidden />
      </Link>
      <form
        action={deleteCustomerAction}
        className="inline"
        onSubmit={(e) => {
          if (
            !confirm(
              `Supprimer définitivement le compte « ${displayName} » ?\n\nImpossible si le client a déjà passé commande.`,
            )
          ) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="id" value={customerId} />
        <button type="submit" className={adminCrudIconBtnDanger} title="Supprimer" aria-label="Supprimer le client">
          <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden />
        </button>
      </form>
    </div>
  );
}
