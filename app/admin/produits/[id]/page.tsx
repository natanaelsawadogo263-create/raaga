import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminProductForm } from "@/components/admin/admin-product-form";
import { requireRole } from "@/lib/auth-guards";
import { fetchAdminCategoryOptions, fetchAdminProductDetail, fetchAdminShopOptions } from "@/lib/admin/data";
import { parseAdminFlash } from "@/lib/admin/flash";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Produit ${id.slice(0, 8)}…` };
}

export default async function AdminEditProduitPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  if (!UUID_RE.test(id)) {
    notFound();
  }

  const sp = await searchParams;
  const { supabase } = await requireRole(["admin", "super_admin"]);
  const [{ shops, error: shopErr }, { categories, error: catErr }, { detail, error: prodErr }] = await Promise.all([
    fetchAdminShopOptions(supabase),
    fetchAdminCategoryOptions(supabase),
    fetchAdminProductDetail(supabase, id),
  ]);

  if (prodErr) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">Erreur : {prodErr}</div>
    );
  }
  if (!detail) {
    notFound();
  }

  const flash = parseAdminFlash(sp);

  return (
    <div className="space-y-4">
      <div>
        <Link href="/admin/produits" className="text-xs font-bold text-[#FF7A00] hover:underline">
          ← Produits
        </Link>
        <h1 className="mt-2 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">{detail.product.name}</h1>
      </div>

      {shopErr ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{shopErr}</div>
      ) : null}
      {catErr ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{catErr}</div>
      ) : null}

      <AdminProductForm
        mode="edit"
        shops={shops}
        categories={categories}
        product={detail.product}
        images={detail.images}
        flash={flash}
      />
    </div>
  );
}
