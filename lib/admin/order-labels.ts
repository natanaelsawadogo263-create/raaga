import type { Database } from "@/lib/supabase/database.types";

export type OrderStatus = Database["public"]["Tables"]["orders"]["Row"]["order_status"];

const LABELS: Record<OrderStatus, string> = {
  validated: "Validée",
  awaiting_driver: "En attente livreur",
  accepted_by_driver: "Acceptée par livreur",
  picked_up: "Collectée",
  in_delivery: "En livraison",
  delivery_declared: "Livraison déclarée",
  secret_validated: "Code validé",
  confirmed_by_customer: "Confirmée client",
  delivered: "Livrée",
  problematic: "Problème",
  cancelled: "Annulée",
};

export function orderStatusLabel(status: OrderStatus): string {
  return LABELS[status] ?? status;
}

export const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = (
  Object.keys(LABELS) as OrderStatus[]
).map((value) => ({ value, label: LABELS[value] }));

export type PaymentMethod = Database["public"]["Tables"]["orders"]["Row"]["payment_method"];

/** Toutes les commandes se règlent à la livraison (espèces à la remise du colis). */
export const SITE_ORDER_PAYMENT_LABEL = "Paiement à la livraison";

export function paymentMethodLabel(_m: PaymentMethod): string {
  return SITE_ORDER_PAYMENT_LABEL;
}
