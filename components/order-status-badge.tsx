import { Clock } from "lucide-react";

const LABELS: Record<string, string> = {
  validated: "Validee",
  awaiting_driver: "En attente livreur",
  accepted_by_driver: "Acceptee",
  picked_up: "Colis recupere",
  in_delivery: "En cours",
  delivery_declared: "Livraison declaree",
  secret_validated: "Code valide",
  confirmed_by_customer: "Confirmee",
  delivered: "Livree",
  problematic: "Problematique",
  cancelled: "Annulee",
};

const STYLES: Record<string, string> = {
  validated: "bg-slate-100 text-slate-800",
  awaiting_driver: "bg-amber-100 text-amber-900",
  accepted_by_driver: "bg-sky-100 text-sky-900",
  picked_up: "bg-indigo-100 text-indigo-900",
  in_delivery: "bg-orange-100 text-orange-900",
  delivery_declared: "bg-violet-100 text-violet-900",
  secret_validated: "bg-emerald-100 text-emerald-900",
  confirmed_by_customer: "bg-lime-100 text-lime-900",
  delivered: "bg-emerald-100 text-emerald-800",
  problematic: "bg-red-100 text-red-800",
  cancelled: "bg-neutral-200 text-neutral-700",
};

type Props = {
  status: string;
  /** Icône horloge (ex. fiche commande type maquette) */
  withClock?: boolean;
};

export function OrderStatusBadge({ status, withClock }: Props) {
  const label = LABELS[status] ?? status.replace(/_/g, " ");
  const cls = STYLES[status] ?? "bg-muted text-foreground";

  return (
    <span className={`inline-flex max-w-full items-center gap-1 truncate rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${cls}`}>
      {withClock ? <Clock className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden /> : null}
      {label}
    </span>
  );
}
