"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ClipboardList } from "lucide-react";
import { adminCrudIconBtn } from "@/components/admin/admin-crud-icon-classes";
import { useAdminUi } from "@/components/admin/admin-ui-context";
import type { AdminOrderListItem } from "@/lib/admin/data";
import { formatCFA, formatOrderDate } from "@/lib/admin/format";
import { orderStatusLabel, paymentMethodLabel } from "@/lib/admin/order-labels";

function matches(q: string, ...parts: string[]) {
  const n = q.trim().toLowerCase();
  if (!n) return true;
  return parts.some((p) => p.toLowerCase().includes(n));
}

function statusBadgeClass(status: AdminOrderListItem["order_status"]) {
  if (status === "delivered" || status === "confirmed_by_customer") return "bg-emerald-100 text-emerald-800";
  if (status === "cancelled") return "bg-rose-100 text-rose-800";
  if (status === "problematic") return "bg-amber-100 text-amber-800";
  return "bg-sky-100 text-sky-800";
}

export function AdminOrdersListClient({ orders }: { orders: AdminOrderListItem[] }) {
  const { searchQuery } = useAdminUi();

  const filtered = useMemo(
    () =>
      orders.filter((o) =>
        matches(
          searchQuery,
          o.reference,
          o.id,
          o.customer_name,
          o.driver_name ?? "",
          orderStatusLabel(o.order_status),
          paymentMethodLabel(o.payment_method),
          String(o.total_cfa),
        ),
      ),
    [orders, searchQuery],
  );

  if (filtered.length === 0) {
    return (
      <p className="p-6 text-center text-sm text-slate-500">
        {orders.length === 0
          ? "Aucune commande pour le moment."
          : `Aucun résultat pour « ${searchQuery} ».`}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto p-4">
      <table className="min-w-full text-left text-xs [&_td]:align-middle [&_th]:whitespace-nowrap">
        <thead className="text-slate-500">
          <tr className="border-b border-slate-200">
            <th className="py-2">Réf.</th>
            <th>Date</th>
            <th>Client</th>
            <th>Livreur</th>
            <th>Montant</th>
            <th>Statut</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((o) => (
            <tr key={o.id} className="border-b border-slate-100">
              <td className="py-2.5 font-mono text-[11px] text-[#FF7A00] whitespace-nowrap tabular-nums">{o.reference}</td>
              <td className="whitespace-nowrap text-slate-600">{formatOrderDate(o.created_at)}</td>
              <td className="max-w-[160px] whitespace-nowrap py-2.5">
                <span className="block truncate font-semibold text-slate-800" title={o.customer_name}>
                  {o.customer_name}
                </span>
              </td>
              <td className="max-w-[140px] whitespace-nowrap py-2.5">
                <span className="block truncate text-slate-600" title={o.driver_name ?? undefined}>
                  {o.driver_name ?? "—"}
                </span>
              </td>
              <td className="whitespace-nowrap font-semibold">{formatCFA(o.total_cfa)}</td>
              <td className="whitespace-nowrap">
                <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${statusBadgeClass(o.order_status)}`}>
                  {orderStatusLabel(o.order_status)}
                </span>
              </td>
              <td className="whitespace-nowrap">
                <div className="flex flex-nowrap justify-end">
                  <Link
                    href={`/admin/commandes/${o.id}`}
                    className={adminCrudIconBtn}
                    title="Gérer la commande"
                    aria-label="Gérer la commande"
                  >
                    <ClipboardList className="h-4 w-4" strokeWidth={2} aria-hidden />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
