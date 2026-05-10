import type { Metadata } from "next";
import { AdminPlaceholder } from "@/components/admin/admin-placeholder";

export const metadata: Metadata = {
  title: "Statistiques",
};

export default function AdminStatistiquesPage() {
  return (
    <AdminPlaceholder title="Statistiques" backHref="/admin" />
  );
}
