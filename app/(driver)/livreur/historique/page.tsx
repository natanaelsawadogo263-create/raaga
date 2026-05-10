import { History, Package } from "lucide-react";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { requireRole } from "@/lib/auth-guards";
import { paymentMethodLabel } from "@/lib/admin/order-labels";
import { formatCFA } from "@/lib/admin/format";

export const dynamic = "force-dynamic";

export default async function LivreurHistoriquePage() {
  const { supabase, user } = await requireRole(["driver"]);

  const { data: orders } = await supabase
    .from("orders")
    .select(
      "id, reference, total_cfa, payment_method, order_status, city, district, sector, updated_at",
    )
    .eq("driver_id", user.id)
    .in("order_status", [
      "delivered",
      "confirmed_by_customer",
      "secret_validated",
      "problematic",
    ])
    .order("updated_at", { ascending: false })
    .limit(50);

  const list = orders ?? [];

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
          <History className="h-4 w-4 text-[#FF7A00]" aria-hidden />
          Mes 50 dernières livraisons
          <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-bold text-[#FF7A00]">
            {list.length}
          </span>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Package className="h-7 w-7" strokeWidth={1.5} aria-hidden />
          </span>
          <p className="mt-3 text-sm font-bold text-slate-800">Pas encore de livraison terminée</p>
          <p className="mt-1 max-w-md text-xs text-slate-500">
            Vos livraisons closes apparaîtront ici avec leur référence et le moyen de paiement.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {list.map((o) => (
            <li
              key={o.id}
              className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p
                    className="font-mono text-sm font-black tabular-nums text-slate-900"
                    translate="no"
                  >
                    #{o.reference}
                  </p>
                  <OrderStatusBadge status={o.order_status} />
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  {o.city} · {o.district} · {o.sector}
                </p>
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                  {paymentMethodLabel(o.payment_method)}
                </span>
                <p className="text-sm font-black tabular-nums text-slate-900">
                  {formatCFA(o.total_cfa)}
                </p>
                <p className="hidden text-[11px] text-slate-500 sm:block">
                  {new Date(o.updated_at).toLocaleString("fr-FR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
