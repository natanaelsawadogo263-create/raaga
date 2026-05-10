import { ChevronRight, Package, ShoppingBag, Store } from "lucide-react";
import { acceptDeliveryTaskAction } from "@/app/actions";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { requireRole } from "@/lib/auth-guards";
import { paymentMethodLabel } from "@/lib/admin/order-labels";
import { formatCFA } from "@/lib/admin/format";

export const dynamic = "force-dynamic";

export default async function LivreurTachesPage() {
  const { supabase, user } = await requireRole(["driver"]);

  const { data: driverProfile } = await supabase
    .from("driver_profiles")
    .select("review_status, is_available")
    .eq("user_id", user.id)
    .maybeSingle();
  const approved = driverProfile?.review_status === "approved";
  const isAvailable = !!driverProfile?.is_available;

  const { data: activeOrder } = await supabase
    .from("orders")
    .select("id")
    .eq("driver_id", user.id)
    .in("order_status", [
      "accepted_by_driver",
      "picked_up",
      "in_delivery",
      "delivery_declared",
    ])
    .limit(1);

  const { data: tasks } = await supabase
    .from("orders")
    .select(
      "id, reference, city, district, sector, delivery_address, total_cfa, payment_method, created_at",
    )
    .eq("order_status", "awaiting_driver")
    .is("driver_id", null)
    .order("created_at", { ascending: true })
    .limit(25);

  const hasActiveTask = (activeOrder ?? []).length > 0;
  const taskList = tasks ?? [];

  const orderIds = taskList.map((t) => t.id);
  type TaskItem = {
    order_id: string;
    quantity: number;
    products: { name: string } | { name: string }[] | null;
    shops: { name: string; city: string } | { name: string; city: string }[] | null;
  };
  const itemsByOrder = new Map<string, TaskItem[]>();
  if (orderIds.length > 0) {
    const { data: items } = await supabase
      .from("order_items")
      .select("order_id, quantity, products ( name ), shops ( name, city )")
      .in("order_id", orderIds);
    for (const it of (items ?? []) as unknown as TaskItem[]) {
      const arr = itemsByOrder.get(it.order_id) ?? [];
      arr.push(it);
      itemsByOrder.set(it.order_id, arr);
    }
  }

  function pickOne<T>(raw: T | T[] | null): T | null {
    if (!raw) return null;
    return Array.isArray(raw) ? (raw[0] ?? null) : raw;
  }

  const acceptDisabled = hasActiveTask || !approved || !isAvailable;

  return (
    <div className="space-y-4">
      {!approved ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 shadow-sm">
          Compte en vérification — vous ne pourrez accepter une tâche qu&apos;une fois votre dossier
          approuvé par l&apos;équipe Raaga.
        </div>
      ) : !isAvailable ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 shadow-sm">
          Vous êtes <strong>hors ligne</strong>. Activez votre disponibilité (bouton vert en haut)
          pour pouvoir accepter une tâche.
        </div>
      ) : null}
      {hasActiveTask ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 shadow-sm">
          Vous avez déjà une course en cours. Terminez-la avant d&apos;en accepter une nouvelle.
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
            <ShoppingBag className="h-4 w-4 text-[#FF7A00]" aria-hidden />
            Commandes en attente
            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-bold text-[#FF7A00]">
              {taskList.length}
            </span>
          </div>
        </div>

        {!taskList.length ? (
          <p className="px-4 py-10 text-center text-sm text-slate-500">
            Aucune tâche pour le moment. Les nouvelles commandes apparaîtront ici dès qu&apos;un
            client valide son panier.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {taskList.map((task) => {
              const items = itemsByOrder.get(task.id) ?? [];
              const shops = new Map<string, string>();
              for (const it of items) {
                const s = pickOne(it.shops);
                if (s) shops.set(s.name, s.city);
              }
              return (
                <li key={task.id} className="px-4 py-4 sm:px-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-lg bg-orange-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#FF7A00] ring-1 ring-orange-200/60">
                          Commande
                        </span>
                        <p
                          className="font-mono text-base font-black tabular-nums text-slate-900"
                          translate="no"
                        >
                          #{task.reference}
                        </p>
                        <OrderStatusBadge status="awaiting_driver" />
                      </div>

                      <p className="mt-2 text-sm font-semibold text-slate-800">
                        {task.delivery_address}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {task.city} · {task.district} · {task.sector}
                      </p>

                      {shops.size > 0 ? (
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                          <Store className="h-3.5 w-3.5 text-[#FF7A00]" aria-hidden />
                          <span className="font-semibold uppercase tracking-wide text-slate-500">
                            À récupérer
                          </span>
                          {[...shops.entries()].map(([name, city]) => (
                            <span
                              key={name}
                              className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-800"
                            >
                              {name} ({city})
                            </span>
                          ))}
                        </div>
                      ) : null}

                      {items.length > 0 ? (
                        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-600">
                          {items.map((it, i) => {
                            const p = pickOne(it.products);
                            return (
                              <li key={`${task.id}-${i}`} className="flex items-center gap-1.5">
                                <Package className="h-3 w-3 shrink-0 text-[#FF7A00]" aria-hidden />
                                <span>
                                  <span className="font-bold text-slate-900">×{it.quantity}</span>{" "}
                                  {p?.name ?? "Article"}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      ) : null}

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <p className="text-lg font-black tabular-nums text-[#FF7A00]">
                          {formatCFA(task.total_cfa)}
                        </p>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                          {paymentMethodLabel(task.payment_method)}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {new Date(task.created_at).toLocaleString("fr-FR", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                    </div>
                    <form action={acceptDeliveryTaskAction} className="shrink-0">
                      <input type="hidden" name="order_id" value={task.id} />
                      <button
                        type="submit"
                        disabled={acceptDisabled}
                        className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#FF7A00] px-4 text-xs font-bold text-white shadow-md shadow-orange-500/25 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
                      >
                        Accepter
                        <ChevronRight className="h-4 w-4" aria-hidden />
                      </button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
