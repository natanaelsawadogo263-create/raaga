import { AdminDashboardView } from "@/components/admin/admin-dashboard-view";
import { fetchAdminDashboardData } from "@/lib/admin/dashboard-data";
import { parseAdminFlash } from "@/lib/admin/flash";
import { requireRole } from "@/lib/auth-guards";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminDashboardPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const { supabase } = await requireRole(["admin", "super_admin"]);
  const { data, error } = await fetchAdminDashboardData(supabase);
  const flash = parseAdminFlash(sp);

  return <AdminDashboardView snapshot={data} loadError={error} flash={flash} />;
}
