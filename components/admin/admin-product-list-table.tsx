import type { AdminProductListItem } from "@/lib/admin/data";
import { formatCFA } from "@/lib/admin/format";
import { AdminProductRowActions } from "@/components/admin/admin-product-row-actions";

const STATUS_LABELS: Record<AdminProductListItem["status"], string> = {
  normal: "Normal",
  promotion: "Promotion",
  nouveaute: "Nouveauté",
  best_seller: "Best-seller",
  rupture: "Rupture",
};

export function AdminProductListTable({
  products,
}: {
  products: Array<{
    id: string;
    name: string;
    shop_name: string | null;
    price_cfa: number;
    stock_quantity: number;
    status: AdminProductListItem["status"];
    is_active: boolean;
    primary_image: string | null;
  }>;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-xs [&_td]:align-middle [&_th]:whitespace-nowrap">
        <thead className="text-slate-500">
          <tr className="border-b border-slate-200">
            <th className="py-2">Visuel</th>
            <th>Produit</th>
            <th>Boutique</th>
            <th>Prix</th>
            <th>Stock</th>
            <th>Statut</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b border-slate-100">
              <td className="py-2 whitespace-nowrap">
                <div className="h-10 w-10 overflow-hidden rounded-lg bg-slate-100">
                  {p.primary_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.primary_image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] text-slate-400">—</div>
                  )}
                </div>
              </td>
              <td className="max-w-[240px] whitespace-nowrap py-2">
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="min-w-0 truncate font-bold text-slate-900" title={p.name}>
                    {p.name}
                  </span>
                  {!p.is_active ? (
                    <span className="shrink-0 text-[10px] font-bold text-rose-600">· Inactif</span>
                  ) : null}
                </div>
              </td>
              <td className="max-w-[140px] whitespace-nowrap py-2">
                <span className="block truncate" title={p.shop_name ?? undefined}>
                  {p.shop_name ?? "—"}
                </span>
              </td>
              <td className="whitespace-nowrap font-semibold">{formatCFA(p.price_cfa)}</td>
              <td className="whitespace-nowrap">{p.stock_quantity}</td>
              <td className="whitespace-nowrap">{STATUS_LABELS[p.status]}</td>
              <td className="text-right whitespace-nowrap">
                <AdminProductRowActions productId={p.id} productName={p.name} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
