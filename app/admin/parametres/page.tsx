import type { Metadata } from "next";
import { AdminPlaceholder } from "@/components/admin/admin-placeholder";

export const metadata: Metadata = {
  title: "Paramètres",
};

export default function AdminParametresPage() {
  return (
    <AdminPlaceholder title="Paramètres" backHref="/admin" />
  );
}
