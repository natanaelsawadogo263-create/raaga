import { CreditCard, MapPin } from "lucide-react";
import { createOrderFromCartAction } from "@/app/actions";
import {
  Field,
  PageHeader,
  PageShell,
  RaCard,
  btnPrimaryClass,
  inputClass,
  textareaClass,
} from "@/components/raaga/page-shell";
import { SITE_ORDER_PAYMENT_LABEL } from "@/lib/admin/order-labels";
import { SyncGuestCartForCheckout } from "@/components/sync-guest-cart-for-checkout";
import { requireRole } from "@/lib/auth-guards";

export const dynamic = "force-dynamic";

export default async function CommandePage() {
  await requireRole(["customer"]);

  return (
    <PageShell>
      <div className="container-raaga py-6 sm:py-10">
        <PageHeader
          align="center"
          eyebrow="Checkout"
          title="Finaliser la commande"
          description="Confirmez l’adresse de livraison. Paiement en espèces à la remise du colis. Frais de base : 1 000 FCFA."
        />

        <RaCard className="mx-auto w-full max-w-2xl" padding="p-6 sm:p-8">
          <SyncGuestCartForCheckout>
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-border/80 bg-orange-50/50 p-4 text-center sm:p-5">
                <MapPin className="h-5 w-5 shrink-0 text-brand" aria-hidden />
                <div>
                  <p className="text-sm font-bold text-foreground">Livraison locale</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Précisez quartier et secteur pour aider le livreur sur le terrain.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-border/80 bg-card p-4 text-center sm:p-5">
                <CreditCard className="h-5 w-5 shrink-0 text-brand" aria-hidden />
                <div>
                  <p className="text-sm font-bold text-foreground">Paiement</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {SITE_ORDER_PAYMENT_LABEL} : vous payez en espèces lorsque le livreur vous remet la commande.
                  </p>
                </div>
              </div>
            </div>

            <form action={createOrderFromCartAction} className="mx-auto max-w-xl space-y-5">
              <div className="rounded-xl border border-border/80 bg-muted/40 px-4 py-3 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Paiement</p>
                <p className="mt-1 text-sm font-bold text-foreground">{SITE_ORDER_PAYMENT_LABEL}</p>
              </div>
              <div className="grid gap-5 sm:grid-cols-3">
                <Field label="Ville" htmlFor="city" align="center">
                  <input id="city" name="city" required autoComplete="address-level2" className={inputClass} />
                </Field>
                <Field label="Quartier" htmlFor="district" align="center">
                  <input id="district" name="district" required className={inputClass} />
                </Field>
                <Field label="Secteur" htmlFor="sector" align="center">
                  <input id="sector" name="sector" required className={inputClass} />
                </Field>
              </div>
              <Field
                label="Adresse détaillée"
                htmlFor="delivery_address"
                hint="Point de repère, nom du concession, couleur de porte…"
                align="center"
              >
                <textarea id="delivery_address" name="delivery_address" required rows={4} className={textareaClass} />
              </Field>
              <p className="text-center text-xs leading-relaxed text-muted-foreground">
                Après validation, un <strong>code à 4 chiffres</strong> vous sera attribué : conservez-le pour le communiquer au livreur au moment de la remise.
              </p>
              <div className="flex justify-center pt-1">
                <button type="submit" className={`${btnPrimaryClass} w-full min-w-[min(100%,18rem)] sm:w-auto sm:min-w-[14rem]`}>
                  Valider la commande
                </button>
              </div>
            </form>
          </SyncGuestCartForCheckout>
        </RaCard>
      </div>
    </PageShell>
  );
}
