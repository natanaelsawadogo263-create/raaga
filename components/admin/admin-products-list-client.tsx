"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAdminUi } from "@/components/admin/admin-ui-context";
import { AdminProductListTable } from "@/components/admin/admin-product-list-table";
import type { AdminProductListItem } from "@/lib/admin/data";

function matches(q: string, ...parts: string[]) {
  const n = q.trim().toLowerCase();
  if (!n) return true;
  return parts.some((p) => p.toLowerCase().includes(n));
}

export function AdminProductsListClient({ products }: { products: AdminProductListItem[] }) {
  const { searchQuery } = useAdminUi();

  const filtered = useMemo(
    () =>
      products.filter((p) =>
        matches(
          searchQuery,
          p.name,
          p.category,
          p.city,
          p.shop_name ?? "",
          p.description,
          STATUS_LABEL(p.status),
          p.is_active ? "actif" : "inactif",
        ),
      ),
    [products, searchQuery],
  );

  if (filtered.length === 0) {
    return (
      <p className="p-6 text-center text-sm text-slate-500">
        {products.length === 0 ? "Aucun produit." : `Aucun résultat pour « ${searchQuery} ».`}
      </p>
    );
  }

  return <AdminProductListTable products={filtered} />;
}

function STATUS_LABEL(s: AdminProductListItem["status"]) {
  const M: Record<AdminProductListItem["status"], string> = {
    normal: "normal",
    promotion: "promotion",
    nouveaute: "nouveauté",
    best_seller: "best-seller",
    rupture: "rupture",
  };
  return M[s];
}
