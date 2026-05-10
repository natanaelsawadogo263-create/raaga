import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminOrderManage } from "@/components/admin/admin-order-manage";
import { requireRole } from "@/lib/auth-guards";
import { fetchAdminOrderDetail, fetchAdminProductsForPicker } from "@/lib/admin/data";
import { parseAdminFlash } from "@/lib/admin/flash";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Commande ${id.slice(0, 8)}…` };
}

export default async function AdminCommandeDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  if (!UUID_RE.test(id)) {
    notFound();
  }

  const sp = await searchParams;
  const { supabase } = await requireRole(["admin", "super_admin"]);

  const [{ detail, error: dErr }, { products, error: pErr }] = await Promise.all([
    fetchAdminOrderDetail(supabase, id),
    fetchAdminProductsForPicker(supabase),
  ]);

  if (dErr) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">Erreur : {dErr}</div>
    );
  }
  if (!detail) {
    notFound();
  }

  const flash = parseAdminFlash(sp);
  const loadError = pErr;

  return (
    <div className="space-y-4">
      {loadError ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Avertissement chargement listes : {loadError}
        </div>
      ) : null}

      <AdminOrderManage detail={detail} products={products} flash={flash} />
    </div>
  );
}
