import type { Metadata } from "next";
import Link from "next/link";
import { AdminShopForm } from "@/components/admin/admin-shop-form";
import { requireRole } from "@/lib/auth-guards";
import { parseAdminFlash } from "@/lib/admin/flash";

export const metadata: Metadata = {
  title: "Nouvelle boutique",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminNouvelleBoutiquePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  await requireRole(["admin", "super_admin"]);
  const flash = parseAdminFlash(sp);

  return (
    <div className="space-y-4">
      <div>
        <Link href="/admin/boutiques" className="text-xs font-bold text-[#FF7A00] hover:underline">
          ← Boutiques
        </Link>
        <h1 className="mt-2 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">Nouvelle boutique</h1>
      </div>

      <AdminShopForm mode="create" flash={flash} />
    </div>
  );
}
