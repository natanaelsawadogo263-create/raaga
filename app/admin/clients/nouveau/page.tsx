import type { Metadata } from "next";
import Link from "next/link";
import { AdminCustomerForm } from "@/components/admin/admin-customer-form";
import { requireRole } from "@/lib/auth-guards";
import { parseAdminFlash } from "@/lib/admin/flash";

export const metadata: Metadata = {
  title: "Nouveau client",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminNouveauClientPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  await requireRole(["admin", "super_admin"]);
  const flash = parseAdminFlash(sp);

  return (
    <div className="space-y-4">
      <div>
        <Link href="/admin/clients" className="text-xs font-bold text-[#FF7A00] hover:underline">
          ← Clients
        </Link>
        <h1 className="mt-2 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">Nouveau client</h1>
      </div>

      <AdminCustomerForm mode="create" flash={flash} />
    </div>
  );
}
