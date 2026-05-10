export type ProductBadgeStatus = "normal" | "promotion" | "nouveaute" | "best-seller" | "best_seller" | "rupture";

type StatusBadgeProps = {
  status: ProductBadgeStatus;
};

function normalizeStatus(status: ProductBadgeStatus): Exclude<ProductBadgeStatus, "best_seller"> {
  return status === "best_seller" ? "best-seller" : status;
}

const labels: Record<Exclude<ProductBadgeStatus, "best_seller">, string> = {
  normal: "Disponible",
  promotion: "Promo",
  nouveaute: "Nouveauté",
  "best-seller": "Best-seller",
  rupture: "Rupture",
};

const styles: Record<Exclude<ProductBadgeStatus, "best_seller">, string> = {
  normal: "bg-emerald-100 text-emerald-700",
  promotion: "bg-orange-100 text-orange-700",
  nouveaute: "bg-blue-100 text-blue-700",
  "best-seller": "bg-violet-100 text-violet-700",
  rupture: "bg-red-100 text-red-700",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const key = normalizeStatus(status);
  return (
    <span className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${styles[key]}`}>
      {labels[key]}
    </span>
  );
}
