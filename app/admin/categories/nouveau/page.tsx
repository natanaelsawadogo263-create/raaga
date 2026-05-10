import type { Metadata } from "next";
import Link from "next/link";
import { AdminCategoryForm } from "@/components/admin/admin-category-form";
import { parseAdminFlash } from "@/lib/admin/flash";

export const metadata: Metadata = {
  title: "Nouvelle catégorie",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminNouvelleCategoriePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const flash = parseAdminFlash(sp);

  return (
    <div className="space-y-4">
      <div>
        <Link href="/admin/categories" className="text-xs font-bold text-[#FF7A00] hover:underline">
          ← Catégories
        </Link>
        <h1 className="mt-2 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">Nouvelle catégorie</h1>
      </div>

      <AdminCategoryForm mode="create" flash={flash} />
    </div>
  );
}
