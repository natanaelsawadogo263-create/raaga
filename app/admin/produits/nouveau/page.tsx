import type { Metadata } from "next";
import Link from "next/link";
import { AdminProductForm } from "@/components/admin/admin-product-form";
import { requireRole } from "@/lib/auth-guards";
import { fetchAdminCategoryOptions, fetchAdminShopOptions } from "@/lib/admin/data";
import { parseAdminFlash } from "@/lib/admin/flash";

export const metadata: Metadata = {
  title: "Nouveau produit",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminNouveauProduitPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const { supabase } = await requireRole(["admin", "super_admin"]);
  const [{ shops, error }, { categories, error: catErr }] = await Promise.all([
    fetchAdminShopOptions(supabase),
    fetchAdminCategoryOptions(supabase),
  ]);
  const flash = parseAdminFlash(sp);

  return (
    <div className="space-y-4">
      <div>
        <Link href="/admin/produits" className="text-xs font-bold text-[#FF7A00] hover:underline">
          ← Produits
        </Link>
        <h1 className="mt-2 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">Nouveau produit</h1>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>
      ) : null}
      {catErr ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{catErr}</div>
      ) : null}

      <AdminProductForm mode="create" shops={shops} categories={categories} flash={flash} />
    </div>
  );
}
