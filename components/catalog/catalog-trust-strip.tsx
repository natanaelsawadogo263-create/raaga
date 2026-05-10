import { CreditCard, Headphones, PackageCheck, Truck } from "lucide-react";

const items = [
  { icon: Truck, label: "Livraison suivie", sub: "Partout au Burkina" },
  { icon: PackageCheck, label: "Stock vérifié", sub: "Disponibilité en temps réel" },
  { icon: CreditCard, label: "Paiement sécurisé", sub: "Mobile money & à la livraison" },
  { icon: Headphones, label: "Support client", sub: "Aide 7j/7" },
] as const;

export function CatalogTrustStrip() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(({ icon: Icon, label, sub }) => (
        <div
          key={label}
          className="flex gap-3 rounded-2xl border border-border/70 bg-card/80 px-4 py-3 shadow-sm ring-1 ring-black/[0.03] backdrop-blur-sm"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand/15 to-amber-500/10 text-brand">
            <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
