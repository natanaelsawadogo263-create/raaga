import type { SupabaseClient } from "@supabase/supabase-js";
import { formatCFA } from "@/lib/admin/format";
import { orderStatusLabel, type OrderStatus } from "@/lib/admin/order-labels";
import type { Database } from "@/lib/supabase/database.types";

const OUAGA_TZ = "Africa/Ouagadougou";

function dateKeyInOuagadougou(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: OUAGA_TZ });
}

function todayKeyOuagadougou(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: OUAGA_TZ });
}

function addDaysToKey(key: string, delta: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + delta));
  return dt.toLocaleDateString("en-CA", { timeZone: OUAGA_TZ });
}

function shortLabelFr(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString("fr-FR", { day: "numeric", month: "short", timeZone: OUAGA_TZ });
}

function pctDelta(today: number, yesterday: number): string {
  if (yesterday <= 0) return today > 0 ? "+100%" : "0%";
  const p = Math.round(((today - yesterday) / yesterday) * 100);
  return `${p >= 0 ? "+" : ""}${p}%`;
}

const CANCELLED: OrderStatus = "cancelled";

function revenueCounts(order: { order_status: OrderStatus; total_cfa: number }): number {
  return order.order_status === CANCELLED ? 0 : order.total_cfa;
}

export type AdminDashboardRevenuePoint = { dateKey: string; label: string; totalCfa: number };

export type AdminDashboardDonutSlice = { label: string; count: number; color: string };

export type AdminDashboardRecentOrder = {
  id: string;
  shortId: string;
  client: string;
  boutique: string;
  amount: string;
  statusLabel: string;
  status: OrderStatus;
};

export type AdminDashboardPendingDriver = { user_id: string; name: string; city: string };

export type AdminDashboardLowStock = {
  productId: string;
  name: string;
  boutique: string;
  stock: number;
};

export type AdminDashboardActivity = { id: string; text: string; atIso: string };

export type AdminDashboardStatCard = {
  title: string;
  value: string;
  deltaLabel: string;
  href: string;
};

export type AdminDashboardData = {
  statCards: AdminDashboardStatCard[];
  revenue7: AdminDashboardRevenuePoint[];
  revenue30: AdminDashboardRevenuePoint[];
  donutSlices: AdminDashboardDonutSlice[];
  donutTotal: number;
  recentOrders: AdminDashboardRecentOrder[];
  pendingDrivers: AdminDashboardPendingDriver[];
  lowStock: AdminDashboardLowStock[];
  activity: AdminDashboardActivity[];
};

const DONUT_COLORS = ["#fbbf24", "#3b82f6", "#22c55e", "#ef4444", "#a855f7", "#64748b"];

function groupStatusForDonut(status: OrderStatus): string {
  if (status === "validated" || status === "awaiting_driver") return "En attente / assignation";
  if (
    status === "accepted_by_driver" ||
    status === "picked_up" ||
    status === "in_delivery" ||
    status === "delivery_declared" ||
    status === "secret_validated"
  ) {
    return "En cours de livraison";
  }
  if (status === "delivered" || status === "confirmed_by_customer") return "Livrées";
  if (status === "cancelled") return "Annulées";
  if (status === "problematic") return "Problèmes";
  return "Autres";
}

export async function fetchAdminDashboardData(
  supabase: SupabaseClient<Database>,
): Promise<{ data: AdminDashboardData | null; error: string | null }> {
  const todayK = todayKeyOuagadougou();
  const yKey = addDaysToKey(todayK, -1);
  const rangeStartKey = addDaysToKey(todayK, -29);

  const rangeStartIso = `${rangeStartKey}T00:00:00.000Z`;

  const [
    ordersRes,
    productsRes,
    driversApprovedRes,
    driversPendingRes,
    shopsRecentRes,
    productsRecentRes,
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("id, reference, order_status, total_cfa, created_at, customer_id")
      .gte("created_at", rangeStartIso)
      .order("created_at", { ascending: false })
      .limit(8000),
    supabase.from("products").select("id, name, created_at, is_active").limit(5000),
    supabase.from("driver_profiles").select("user_id", { count: "exact", head: true }).eq("review_status", "approved"),
    supabase.from("driver_profiles").select("user_id").eq("review_status", "pending"),
    supabase.from("shops").select("id, name, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("products").select("id, name, created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  if (ordersRes.error) {
    return { data: null, error: ordersRes.error.message };
  }
  if (productsRes.error) {
    return { data: null, error: productsRes.error.message };
  }
  if (driversApprovedRes.error) {
    return { data: null, error: driversApprovedRes.error.message };
  }
  if (driversPendingRes.error) {
    return { data: null, error: driversPendingRes.error.message };
  }
  if (shopsRecentRes.error) {
    return { data: null, error: shopsRecentRes.error.message };
  }
  if (productsRecentRes.error) {
    return { data: null, error: productsRecentRes.error.message };
  }

  const orders = ordersRes.data ?? [];
  const allProducts = productsRes.data ?? [];

  const ordersToday = orders.filter((o) => dateKeyInOuagadougou(o.created_at) === todayK);
  const ordersYesterday = orders.filter((o) => dateKeyInOuagadougou(o.created_at) === yKey);

  const revToday = ordersToday.reduce((s, o) => s + revenueCounts(o), 0);
  const revYesterday = ordersYesterday.reduce((s, o) => s + revenueCounts(o), 0);

  const activeProducts = allProducts.filter((p) => p.is_active).length;
  const weekKey = addDaysToKey(todayK, -7);
  const productsCreated7d = allProducts.filter((p) => dateKeyInOuagadougou(p.created_at) >= weekKey).length;

  const driversApproved = driversApprovedRes.count ?? 0;
  const pendingRows = driversPendingRes.data ?? [];
  const pendingIds = pendingRows.map((r) => r.user_id);

  let pendingDrivers: AdminDashboardPendingDriver[] = [];
  if (pendingIds.length > 0) {
    const { data: profs, error: pErr } = await supabase
      .from("user_profiles")
      .select("id, first_name, last_name, city, role")
      .in("id", pendingIds)
      .eq("role", "driver");
    if (pErr) {
      return { data: null, error: pErr.message };
    }
    pendingDrivers = (profs ?? []).map((p) => ({
      user_id: p.id,
      name: `${p.first_name} ${p.last_name}`.trim(),
      city: p.city?.trim() || "—",
    }));
  }

  const statCards: AdminDashboardStatCard[] = [
    {
      title: "Commandes (jour)",
      value: String(ordersToday.length),
      deltaLabel: `${pctDelta(ordersToday.length, ordersYesterday.length)} vs hier (${ordersYesterday.length})`,
      href: "/admin/commandes",
    },
    {
      title: "Produits actifs",
      value: String(activeProducts),
      deltaLabel: `${productsCreated7d} créé(s) sur 7 jours`,
      href: "/admin/produits",
    },
    {
      title: "Livreurs approuvés",
      value: String(driversApproved),
      deltaLabel: `${pendingDrivers.length} en attente de validation`,
      href: "/admin/livreurs",
    },
    {
      title: "Chiffre du jour",
      value: formatCFA(revToday),
      deltaLabel: `${pctDelta(revToday, revYesterday)} vs hier (${formatCFA(revYesterday)})`,
      href: "/admin/statistiques",
    },
  ];

  function buildRevenueSeries(days: number): AdminDashboardRevenuePoint[] {
    const keys: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      keys.push(addDaysToKey(todayK, -i));
    }
    const byKey = new Map<string, number>();
    for (const k of keys) {
      byKey.set(k, 0);
    }
    for (const o of orders) {
      const k = dateKeyInOuagadougou(o.created_at);
      if (!byKey.has(k)) continue;
      byKey.set(k, (byKey.get(k) ?? 0) + revenueCounts(o));
    }
    return keys.map((dateKey) => ({
      dateKey,
      label: shortLabelFr(dateKey),
      totalCfa: byKey.get(dateKey) ?? 0,
    }));
  }

  const revenue7 = buildRevenueSeries(7);
  const revenue30 = buildRevenueSeries(30);

  const statusGroups = new Map<string, number>();
  for (const o of orders) {
    const g = groupStatusForDonut(o.order_status as OrderStatus);
    statusGroups.set(g, (statusGroups.get(g) ?? 0) + 1);
  }
  const donutEntries = [...statusGroups.entries()].sort((a, b) => b[1] - a[1]);
  const donutTotal = donutEntries.reduce((s, [, c]) => s + c, 0);
  const donutSlices: AdminDashboardDonutSlice[] = donutEntries.map(([label, count], i) => ({
    label,
    count,
    color: DONUT_COLORS[i % DONUT_COLORS.length],
  }));

  const recentOrderRows = orders.slice(0, 8);
  const orderIds = recentOrderRows.map((o) => o.id);
  const customerIds = [...new Set(recentOrderRows.map((o) => o.customer_id))];

  const [itemsRes, profilesRes] = await Promise.all([
    orderIds.length
      ? supabase.from("order_items").select("order_id, shop_id").in("order_id", orderIds)
      : Promise.resolve({ data: [] as { order_id: string; shop_id: string }[], error: null }),
    customerIds.length
      ? supabase.from("user_profiles").select("id, first_name, last_name").in("id", customerIds)
      : Promise.resolve({ data: [] as { id: string; first_name: string; last_name: string }[], error: null }),
  ]);

  if (itemsRes.error) {
    return { data: null, error: itemsRes.error.message };
  }
  if (profilesRes.error) {
    return { data: null, error: profilesRes.error.message };
  }

  const itemsForOrders = itemsRes.data;
  const customerProfiles = profilesRes.data;

  const firstShopByOrder = new Map<string, string>();
  const shopIdsNeeded = new Set<string>();
  for (const row of itemsForOrders ?? []) {
    if (!firstShopByOrder.has(row.order_id)) {
      firstShopByOrder.set(row.order_id, row.shop_id);
      shopIdsNeeded.add(row.shop_id);
    }
  }
  const shopNames = new Map<string, string>();
  if (shopIdsNeeded.size > 0) {
    const { data: shops } = await supabase.from("shops").select("id, name").in("id", [...shopIdsNeeded]);
    for (const s of shops ?? []) {
      shopNames.set(s.id, s.name);
    }
  }

  const custMap = new Map((customerProfiles ?? []).map((p) => [p.id, `${p.first_name} ${p.last_name}`.trim()]));

  const recentOrders: AdminDashboardRecentOrder[] = recentOrderRows.map((o) => {
    const sid = firstShopByOrder.get(o.id);
    const boutique = sid ? (shopNames.get(sid) ?? "—") : "—";
    return {
      id: o.id,
      shortId: o.reference,
      client: custMap.get(o.customer_id) ?? "—",
      boutique,
      amount: formatCFA(o.total_cfa),
      statusLabel: orderStatusLabel(o.order_status as OrderStatus),
      status: o.order_status as OrderStatus,
    };
  });

  const { data: lowStockRows, error: lowErr } = await supabase
    .from("products")
    .select("id, name, shop_id, stock_quantity, low_stock_threshold, is_active")
    .eq("is_active", true)
    .order("stock_quantity", { ascending: true })
    .limit(400);

  if (lowErr) {
    return { data: null, error: lowErr.message };
  }

  type ProductLow = {
    id: string;
    name: string;
    shop_id: string;
    stock_quantity: number;
    low_stock_threshold: number;
  };

  const lowCandidates = (lowStockRows ?? [])
    .map((r) => r as ProductLow)
    .filter((r) => r.stock_quantity <= r.low_stock_threshold)
    .slice(0, 8);

  const lowShopIds = [...new Set(lowCandidates.map((r) => r.shop_id))];
  const lowShopNames = new Map<string, string>();
  if (lowShopIds.length > 0) {
    const { data: ls, error: lsErr } = await supabase.from("shops").select("id, name").in("id", lowShopIds);
    if (lsErr) {
      return { data: null, error: lsErr.message };
    }
    for (const s of ls ?? []) {
      lowShopNames.set(s.id, s.name);
    }
  }

  const lowStock: AdminDashboardLowStock[] = lowCandidates.map((r) => ({
    productId: r.id,
    name: r.name,
    boutique: lowShopNames.get(r.shop_id) ?? "—",
    stock: r.stock_quantity,
  }));

  const activity: AdminDashboardActivity[] = [];
  for (const o of orders.slice(0, 6)) {
    const cname = custMap.get(o.customer_id) ?? "Client";
    activity.push({
      id: `ord-${o.id}`,
      text: `Commande ${o.id.slice(0, 8)}… — ${cname} — ${formatCFA(o.total_cfa)}`,
      atIso: o.created_at,
    });
  }
  const prodRecent = (productsRecentRes.data ?? []) as { id: string; name: string; created_at: string }[];
  for (const p of prodRecent.slice(0, 4)) {
    activity.push({
      id: `prd-${p.id}`,
      text: `Produit « ${p.name} » ajouté au catalogue`,
      atIso: p.created_at,
    });
  }
  const shopsRecent = (shopsRecentRes.data ?? []) as { id: string; name: string; created_at: string }[];
  for (const s of shopsRecent.slice(0, 3)) {
    activity.push({
      id: `shop-${s.id}`,
      text: `Boutique « ${s.name} » enregistrée`,
      atIso: s.created_at,
    });
  }
  activity.sort((a, b) => new Date(b.atIso).getTime() - new Date(a.atIso).getTime());
  const activityTop = activity.slice(0, 10);

  return {
    data: {
      statCards,
      revenue7,
      revenue30,
      donutSlices,
      donutTotal,
      recentOrders,
      pendingDrivers,
      lowStock,
      activity: activityTop,
    },
    error: null,
  };
}
