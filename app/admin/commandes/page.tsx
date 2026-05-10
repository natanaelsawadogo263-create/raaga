import type { Metadata } from "next";
import Link from "next/link";
import { AdminOrdersListClient } from "@/components/admin/admin-orders-list-client";
import { requireRole } from "@/lib/auth-guards";
import { fetchAdminOrders } from "@/lib/admin/data";
import { parseAdminFlash } from "@/lib/admin/flash";

export const metadata: Metadata = {
  title: "Commandes",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminCommandesPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const { supabase } = await requireRole(["admin", "super_admin"]);
  const { orders, error: fetchError } = await fetchAdminOrders(supabase);
  const flash = parseAdminFlash(sp);

  return (
    <div className="space-y-4">
      <div>
        <Link href="/admin" className="text-xs font-bold text-[#FF7A00] hover:underline">
          ← Tableau de bord
        </Link>
        <h1 className="mt-2 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">Commandes</h1>
      </div>

      {fetchError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          Erreur chargement : {fetchError}
        </div>
      ) : null}
      {flash.error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{flash.error}</div>
      ) : null}
      {flash.ok ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{flash.ok}</div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-bold text-slate-900">Toutes les commandes ({orders.length})</h2>
        </div>
        <AdminOrdersListClient orders={orders} />
      </div>
    </div>
  );
}
