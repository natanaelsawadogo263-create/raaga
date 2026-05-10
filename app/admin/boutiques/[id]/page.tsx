import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShopForm } from "@/components/admin/admin-shop-form";
import { requireRole } from "@/lib/auth-guards";
import { fetchAdminShopById } from "@/lib/admin/data";
import { parseAdminFlash } from "@/lib/admin/flash";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Boutique ${id.slice(0, 8)}…` };
}

export default async function AdminEditBoutiquePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  if (!UUID_RE.test(id)) {
    notFound();
  }

  const sp = await searchParams;
  const { supabase } = await requireRole(["admin", "super_admin"]);
  const { shop, error } = await fetchAdminShopById(supabase, id);
  const flash = parseAdminFlash(sp);

  if (error) {
    return <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">Erreur : {error}</div>;
  }
  if (!shop) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <div>
        <Link href="/admin/boutiques" className="text-xs font-bold text-[#FF7A00] hover:underline">
          ← Boutiques
        </Link>
        <h1 className="mt-2 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">{shop.name}</h1>
      </div>

      <AdminShopForm mode="edit" shop={shop} flash={flash} />
    </div>
  );
}
