import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  MapPin,
  Package,
  Phone,
  ShoppingBag,
  Star,
  Store,
  User,
  Wallet,
} from "lucide-react";
import { DriverTaskPackageImages } from "@/components/livreur/driver-task-package-images";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { requireRole } from "@/lib/auth-guards";
import { fetchDriverTaskItemsByOrderIds } from "@/lib/driver-task-items";
import { paymentMethodLabel } from "@/lib/admin/order-labels";
import { formatCFA } from "@/lib/admin/format";

export const dynamic = "force-dynamic";

type ActiveOrder = {
  id: string;
  reference: string;
  customer_id: string;
  total_cfa: number;
  payment_method: "cod" | "orange_money" | "moov_money";
  delivery_address: string;
  city: string;
  district: string;
  sector: string;
  order_status:
    | "accepted_by_driver"
    | "picked_up"
    | "in_delivery"
    | "delivery_declared";
};

type AvailableTask = {
  id: string;
  reference: string;
  city: string;
  district: string;
  sector: string;
  total_cfa: number;
  payment_method: "cod" | "orange_money" | "moov_money";
};

function StatCard({
  icon,
  label,
  value,
  hint,
  accent = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  accent?: "default" | "green" | "orange" | "amber";
}) {
  const accentStyles =
    accent === "green"
      ? { bg: "bg-emerald-50", ring: "ring-emerald-100", icon: "bg-emerald-100 text-emerald-600", value: "text-emerald-700" }
      : accent === "orange"
        ? { bg: "bg-orange-50", ring: "ring-orange-100", icon: "bg-orange-100 text-[#FF7A00]", value: "text-slate-900" }
        : accent === "amber"
          ? { bg: "bg-amber-50", ring: "ring-amber-100", icon: "bg-amber-100 text-amber-700", value: "text-slate-900" }
          : { bg: "bg-white", ring: "ring-slate-100", icon: "bg-slate-100 text-slate-700", value: "text-slate-900" };

  return (
    <div className={`rounded-2xl border border-slate-200/80 ${accentStyles.bg} p-4 shadow-sm ring-1 ${accentStyles.ring}`}>
      <div className="flex items-center justify-between">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${accentStyles.icon}`}>
          {icon}
        </span>
      </div>
      <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-black tabular-nums leading-none ${accentStyles.value}`}>{value}</p>
      {hint ? <p className="mt-1 text-[11px] text-slate-500">{hint}</p> : null}
    </div>
  );
}

type PageProps = {
  searchParams: Promise<{ ok?: string }>;
};

export default async function LivreurDashboardPage({ searchParams }: PageProps) {
  const { supabase, user } = await requireRole(["driver"]);
  const sp = await searchParams;
  const showValidatedFlash = sp.ok === "delivery_validated";

  const driverRes = await supabase
    .from("driver_profiles")
    .select("review_status, is_available, wallet_balance_cfa, wallet_pending_cfa, average_rating")
    .eq("user_id", user.id)
    .maybeSingle();

  const driverProfile = driverRes.data;
  const approved = driverProfile?.review_status === "approved";
  const isAvailable = !!driverProfile?.is_available;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayIso = todayStart.toISOString();

  const [todayCountRes, totalCountRes, activeRes, availableListRes, availableCountRes] =
    await Promise.all([
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("driver_id", user.id)
        .in("order_status", ["delivered", "confirmed_by_customer", "secret_validated"])
        .gte("updated_at", todayIso),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("driver_id", user.id)
        .in("order_status", ["delivered", "confirmed_by_customer"]),
      supabase
        .from("orders")
        .select(
          "id, reference, customer_id, total_cfa, payment_method, delivery_address, city, district, sector, order_status",
        )
        .eq("driver_id", user.id)
        .in("order_status", [
          "accepted_by_driver",
          "picked_up",
          "in_delivery",
          "delivery_declared",
        ])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("orders")
        .select("id, reference, city, district, sector, total_cfa, payment_method")
        .eq("order_status", "awaiting_driver")
        .is("driver_id", null)
        .order("created_at", { ascending: true })
        .limit(3),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("order_status", "awaiting_driver")
        .is("driver_id", null),
    ]);

  const livraisonsJour = todayCountRes.count ?? 0;
  const livraisonsTotales = totalCountRes.count ?? 0;
  const tachesDisponiblesCount = availableCountRes.count ?? 0;
  const activeOrder = (activeRes.data ?? null) as ActiveOrder | null;
  const availableTasks = (availableListRes.data ?? []) as AvailableTask[];

  function pickOne<T>(raw: T | T[] | null): T | null {
    if (!raw) return null;
    return Array.isArray(raw) ? (raw[0] ?? null) : raw;
  }

  const previewOrderIds = availableTasks.map((t) => t.id);
  const { packageLinesByOrder } = await fetchDriverTaskItemsByOrderIds(supabase, previewOrderIds);

  let activeCustomer: { first_name: string; last_name: string; phone: string } | null = null;
  let activeShopName: string | null = null;
  let activeArticleCount = 0;
  if (activeOrder) {
    const [{ data: cust }, { data: items }] = await Promise.all([
      supabase
        .from("user_profiles")
        .select("first_name, last_name, phone")
        .eq("id", activeOrder.customer_id)
        .maybeSingle(),
      supabase
        .from("order_items")
        .select("quantity, shops ( name )")
        .eq("order_id", activeOrder.id),
    ]);
    activeCustomer = cust ?? null;
    type ItemRow = { quantity: number; shops: { name: string } | { name: string }[] | null };
    /**
     * Les types générés de Supabase déclarent `order_items.Relationships: []`
     * (la FK vers shops est implicite via l'embed Postgres). On cast à travers
     * `unknown` pour conserver un typage strict côté lecture sans bloquer le
     * build.
     */
    const rows = (items ?? []) as unknown as ItemRow[];
    for (const it of rows) {
      activeArticleCount += it.quantity;
      const s = Array.isArray(it.shops) ? it.shops[0] ?? null : it.shops;
      if (s && !activeShopName) activeShopName = s.name;
    }
  }

  const rating = driverProfile?.average_rating ?? null;

  return (
    <div className="space-y-4">
      {showValidatedFlash ? (
        <section className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/25">
              <CheckCircle2 className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-emerald-900">
                Course terminée — bravo, vous êtes libre !
              </p>
              <p className="mt-0.5 text-xs text-emerald-900/80">
                La livraison a été validée et déplacée dans votre historique. Vous pouvez accepter
                une nouvelle tâche dès maintenant.
              </p>
            </div>
            <Link
              href="/livreur/taches"
              className="hidden shrink-0 items-center gap-1.5 rounded-xl bg-[#FF7A00] px-3 py-2 text-xs font-bold text-white shadow-md shadow-orange-500/25 hover:brightness-105 sm:inline-flex"
            >
              <ClipboardList className="h-4 w-4" aria-hidden />
              Voir les tâches
            </Link>
          </div>
        </section>
      ) : null}

      {!approved ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 shadow-sm">
          Compte en vérification — vous verrez les tâches dès que l&apos;équipe Raaga aura validé
          votre dossier.
        </div>
      ) : !isAvailable ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 shadow-sm">
          Vous êtes <strong>hors ligne</strong>. Activez votre disponibilité (bouton vert en haut)
          pour voir les tâches disponibles.
        </div>
      ) : null}

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={<Package className="h-4 w-4" aria-hidden />}
          label="Livraisons du jour"
          value={String(livraisonsJour)}
          hint={`${livraisonsTotales} terminée${livraisonsTotales > 1 ? "s" : ""} au total`}
          accent="orange"
        />
        <StatCard
          icon={<ClipboardList className="h-4 w-4" aria-hidden />}
          label="Tâches disponibles"
          value={String(tachesDisponiblesCount)}
          hint={tachesDisponiblesCount > 0 ? "Voir la liste pour accepter" : "Aucune en attente"}
        />
        <StatCard
          icon={<Wallet className="h-4 w-4" aria-hidden />}
          label="Gains disponibles"
          value={formatCFA(driverProfile?.wallet_balance_cfa ?? 0)}
          hint="Retrait possible"
          accent="green"
        />
        <StatCard
          icon={<Clock className="h-4 w-4" aria-hidden />}
          label="Gains en attente"
          value={formatCFA(driverProfile?.wallet_pending_cfa ?? 0)}
          hint="Sur courses non clôturées"
          accent="amber"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* Active task */}
        <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 bg-orange-50/40 px-4 py-3">
            <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
              <ShoppingBag className="h-4 w-4 text-[#FF7A00]" aria-hidden />
              Course en cours
            </div>
            {activeOrder ? <OrderStatusBadge status={activeOrder.order_status} /> : null}
          </div>

          {!activeOrder ? (
            <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Package className="h-7 w-7" strokeWidth={1.5} aria-hidden />
              </span>
              <p className="mt-3 text-sm font-bold text-slate-800">Aucune course active</p>
              <p className="mt-1 max-w-md text-xs text-slate-500">
                Acceptez une nouvelle course depuis « Tâches disponibles » pour la voir ici.
              </p>
              <Link
                href="/livreur/taches"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#FF7A00] px-4 py-2 text-xs font-bold text-white shadow-md shadow-orange-500/25 hover:brightness-105"
              >
                <ClipboardList className="h-4 w-4" aria-hidden />
                Voir les tâches
              </Link>
            </div>
          ) : (
            <div className="p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-[#FF7A00]">
                  <Package className="h-6 w-6" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-base font-black tabular-nums text-slate-900" translate="no">
                    Cmd #{activeOrder.reference}
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-slate-600">
                    {activeCustomer ? (
                      <li className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 shrink-0 text-[#FF7A00]" aria-hidden />
                        <span className="truncate">
                          Client :{" "}
                          <span className="font-semibold text-slate-900">
                            {activeCustomer.first_name} {activeCustomer.last_name}
                          </span>
                        </span>
                      </li>
                    ) : null}
                    <li className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-[#FF7A00]" aria-hidden />
                      <span className="truncate">
                        {activeOrder.delivery_address} — {activeOrder.district}
                      </span>
                    </li>
                    {activeShopName ? (
                      <li className="flex items-center gap-2">
                        <Store className="h-3.5 w-3.5 shrink-0 text-[#FF7A00]" aria-hidden />
                        <span className="truncate">Boutique : {activeShopName}</span>
                      </li>
                    ) : null}
                  </ul>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-dashed border-slate-200 pt-4 text-center">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Articles
                  </p>
                  <p className="mt-1 text-sm font-black text-slate-900">{activeArticleCount}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Total
                  </p>
                  <p className="mt-1 text-sm font-black tabular-nums text-slate-900">
                    {formatCFA(activeOrder.total_cfa)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Paiement
                  </p>
                  <p className="mt-1 text-[11px] font-bold leading-tight text-slate-900">
                    {paymentMethodLabel(activeOrder.payment_method)}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <Link
                  href="/livreur/en-cours"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-3 text-xs font-bold text-[#FF7A00] hover:bg-orange-50"
                >
                  <ClipboardList className="h-4 w-4" aria-hidden />
                  Voir détails
                </Link>
                {activeCustomer?.phone ? (
                  <a
                    href={`tel:${activeCustomer.phone.replace(/\s/g, "")}`}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-3 text-xs font-bold text-[#FF7A00] hover:bg-orange-50"
                  >
                    <Phone className="h-4 w-4" aria-hidden />
                    Appeler le client
                  </a>
                ) : (
                  <span className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-500">
                    <Phone className="h-4 w-4" aria-hidden />
                    Pas de téléphone
                  </span>
                )}
                <Link
                  href="/livreur/en-cours"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#FF7A00] px-3 text-xs font-bold text-white shadow-md shadow-orange-500/25 hover:brightness-105"
                >
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                  Étape suivante
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Wallet + Notes */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/60 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
                <Wallet className="h-4 w-4 text-emerald-600" aria-hidden />
                Portefeuille
              </div>
              <Link
                href="/livreur/portefeuille"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline"
              >
                Détails
                <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-white/70 p-3 text-center">
                <p className="text-base font-black tabular-nums text-slate-900">
                  {formatCFA(
                    (driverProfile?.wallet_balance_cfa ?? 0) +
                      (driverProfile?.wallet_pending_cfa ?? 0),
                  )}
                </p>
                <p className="mt-0.5 text-[10px] font-semibold uppercase text-slate-500">Total</p>
              </div>
              <div className="rounded-xl bg-emerald-100/80 p-3 text-center">
                <p className="text-base font-black tabular-nums text-emerald-700">
                  {formatCFA(driverProfile?.wallet_balance_cfa ?? 0)}
                </p>
                <p className="mt-0.5 text-[10px] font-semibold uppercase text-emerald-700/80">
                  Disponibles
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200/70 bg-amber-50/60 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
                Mes notes
              </div>
              <Link
                href="/livreur/notes"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:underline"
              >
                Détails
                <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <p className="text-3xl font-black tabular-nums text-slate-900">
                {rating != null ? Number(rating).toFixed(1) : "—"}
              </p>
              <p className="text-xs font-bold text-slate-500">/ 5</p>
            </div>
            <p className="mt-1 text-[11px] leading-snug text-slate-600">
              {rating != null
                ? "Maintenez votre score en livrant à l'heure et avec sourire."
                : "Vos premières évaluations apparaîtront après vos premières livraisons."}
            </p>
          </div>
        </aside>
      </div>

      {/* Available tasks preview */}
      {approved ? (
        <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
              <ClipboardList className="h-4 w-4 text-[#FF7A00]" aria-hidden />
              Tâches disponibles{" "}
              <span className="text-xs font-semibold text-slate-500">
                ({tachesDisponiblesCount})
              </span>
            </div>
            <Link
              href="/livreur/taches"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#FF7A00] hover:underline"
            >
              Voir toutes
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
          {availableTasks.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">
              {activeOrder
                ? "Terminez votre course actuelle avant d'en accepter une nouvelle."
                : "Aucune tâche pour le moment."}
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {availableTasks.map((t) => (
                <li
                  key={t.id}
                  className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className="font-mono text-sm font-black tabular-nums text-slate-900"
                      translate="no"
                    >
                      Cmd #{t.reference}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-slate-500">
                      {t.city} · {t.district} · {t.sector}
                    </p>
                    {packageLinesByOrder.get(t.id)?.length ? (
                      <DriverTaskPackageImages
                        lines={packageLinesByOrder.get(t.id)!}
                        variant="compact"
                      />
                    ) : (
                      <span className="mt-2 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-[#FF7A00]">
                        <Package className="h-5 w-5" aria-hidden />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="text-right">
                      <p className="text-sm font-black tabular-nums text-slate-900">
                        {formatCFA(t.total_cfa)}
                      </p>
                      <p className="text-[10px] text-slate-500">{paymentMethodLabel(t.payment_method)}</p>
                    </div>
                    <Link
                      href="/livreur/taches"
                      className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-orange-200 bg-white px-3 text-xs font-bold text-[#FF7A00] hover:bg-orange-50"
                    >
                      Voir
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}
