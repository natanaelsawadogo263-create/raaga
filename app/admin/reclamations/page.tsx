import type { Metadata } from "next";
import { AdminPlaceholder } from "@/components/admin/admin-placeholder";

export const metadata: Metadata = {
  title: "Réclamations",
};

export default function AdminReclamationsPage() {
  return (
    <AdminPlaceholder title="Réclamations" backHref="/admin" />
  );
}
