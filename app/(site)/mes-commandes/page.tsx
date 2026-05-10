import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";
import {
  EmptyState,
  PageHeader,
  PageShell,
  RaCard,
  btnSecondaryClass,
} from "@/components/raaga/page-shell";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { requireRole } from "@/lib/auth-guards";
import { paymentMethodLabel } from "@/lib/admin/order-labels";

export const dynamic = "force-dynamic";

export default async function MesCommandesPage() {
  const { supabase, user } = await requireRole(["customer"]);

  const { data: orders } = await supabase
    .from("orders")
    .select("id, reference, order_status, payment_method, total_cfa, created_at")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  const list = orders ?? [];

  return (
    <PageShell>
      <div className="container-raaga py-6 sm:py-10">
        <PageHeader
          eyebrow="Historique"
          title="Mes commandes"
          description="Retrouvez le statut de chaque livraison et ouvrez le suivi detaille en un geste."
        />

        {!list.length ? (
          <EmptyState
            title="Aucune commande"
            description="Vos prochains achats apparaitront ici avec le montant et le statut en temps reel."
            action={{ href: "/produits", label: "Decouvrir les produits" }}
          />
        ) : (
          <div className="space-y-4">
            {list.map((order) => (
              <RaCard key={order.id} padding="p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand/15 to-amber-500/10 text-brand">
                      <Package className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-foreground">Commande n° {order.reference}</p>
                        <OrderStatusBadge status={order.order_status} />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Paiement :{" "}
                        <span className="font-medium text-foreground">
                          {paymentMethodLabel(order.payment_method)}
                        </span>
                      </p>
                      <p className="mt-2 text-lg font-black tabular-nums text-brand">{order.total_cfa.toLocaleString("fr-FR")} FCFA</p>
                    </div>
                  </div>
                  <Link
                    href={`/suivi?orderId=${order.id}`}
                    className={`${btnSecondaryClass} shrink-0 self-start sm:self-center`}
                  >
                    Suivre
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
              </RaCard>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
