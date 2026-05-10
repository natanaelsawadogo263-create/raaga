import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminShopsListClient } from "@/components/admin/admin-shops-list-client";
import { requireRole } from "@/lib/auth-guards";
import { fetchAdminShopsList } from "@/lib/admin/data";
import { parseAdminFlash } from "@/lib/admin/flash";

export const metadata: Metadata = {
  title: "Boutiques",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminBoutiquesPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const { supabase } = await requireRole(["admin", "super_admin"]);
  const { shops, error: fetchError } = await fetchAdminShopsList(supabase);
  const flash = parseAdminFlash(sp);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/admin" className="text-xs font-bold text-[#FF7A00] hover:underline">
            ← Tableau de bord
          </Link>
          <h1 className="mt-2 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">Boutiques</h1>
        </div>
        <Link
          href="/admin/boutiques/nouveau"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF7A00] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#e66e00]"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          Nouvelle boutique
        </Link>
      </div>

      {fetchError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">Erreur : {fetchError}</div>
      ) : null}
      {flash.error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{flash.error}</div>
      ) : null}
      {flash.ok ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{flash.ok}</div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 px-4 py-3.5 sm:px-5">
          <h2 className="text-sm font-bold text-slate-900">Boutiques enregistrées</h2>
          <p className="text-xs font-medium text-slate-500">{shops.length} fiche{shops.length !== 1 ? "s" : ""}</p>
        </div>
        <AdminShopsListClient shops={shops} />
      </div>
    </div>
  );
}
