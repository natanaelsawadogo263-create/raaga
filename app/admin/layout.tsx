import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireRole } from "@/lib/auth-guards";

export const metadata: Metadata = {
  title: {
    default: "Tableau de bord",
    template: "%s | Raaga Admin",
  },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireRole(["admin", "super_admin"]);
  const adminName =
    typeof user.user_metadata?.first_name === "string" && user.user_metadata.first_name.trim()
      ? `${user.user_metadata.first_name} ${typeof user.user_metadata?.last_name === "string" ? user.user_metadata.last_name : ""}`.trim()
      : "Admin Raaga";
  const adminFirstName = adminName.split(" ")[0] ?? "Admin";

  return (
    <AdminShell adminName={adminName} adminFirstName={adminFirstName}>
      {children}
    </AdminShell>
  );
}
