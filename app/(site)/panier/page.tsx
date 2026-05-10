import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { CartLineThumbnail } from "@/components/cart-line-thumbnail";
import { removeFromCartAction, updateCartItemQuantityAction } from "@/app/actions";
import { GuestPanierView } from "@/components/guest-panier-view";
import {
  EmptyState,
  PageHeader,
  PageShell,
  RaCard,
  btnDangerOutlineClass,
  btnPrimaryClass,
  cartQtyStepperBtnClass,
  cartQtyStepperWrapClass,
} from "@/components/raaga/page-shell";
import { pickPrimaryImage } from "@/lib/catalog-products";
import { requireRole } from "@/lib/auth-guards";
import { getSiteCartBadge } from "@/lib/site-cart-server";

export const dynamic = "force-dynamic";

type CartRow = {
  id: string;
  product_id: string;
  quantity: number;
};

export default async function PanierPage() {
  const { isCustomer } = await getSiteCartBadge();
  if (!isCustomer) {
    return <GuestPanierView />;
  }

  const { supabase, user } = await requireRole(["customer"]);

  const { data: cartRows } = await supabase.from("carts").select("id, product_id, quantity").eq("user_id", user.id);
  const cartItems: CartRow[] = cartRows ?? [];

  const productIds = cartItems.map((item) => item.product_id);
  const { data: products } = productIds.length
    ? await supabase
        .from("products")
        .select("id, name, price_cfa, city, stock_quantity, product_images ( image_url, is_primary, sort_order )")
        .in("id", productIds)
    : { data: [] };

  const productMap = new Map((products ?? []).map((product) => [product.id, product]));
  const enriched = cartItems
    .map((item) => {
      const product = productMap.get(item.product_id);
      if (!product) {
        return null;
      }
      const lineTotal = item.quantity * product.price_cfa;
      const imgs = product.product_images as unknown as
        | { image_url: string; is_primary: boolean; sort_order: number }[]
        | null
        | undefined;
      const imageUrl = pickPrimaryImage(imgs);
      return { ...item, product, lineTotal, imageUrl };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const subtotal = enriched.reduce((sum, item) => sum + item.lineTotal, 0);
  const deliveryFee = enriched.length ? 1000 : 0;
  const total = subtotal + deliveryFee;

  return (
    <PageShell>
      <div className="container-raaga py-6 sm:py-10">
        <PageHeader
          eyebrow="Panier"
          title="Votre selection"
          description="Modifiez les quantites, verifiez les montants et passez commande quand vous etes pret."
        />

        {!enriched.length ? (
          <EmptyState
            title="Panier vide"
            description="Ajoutez des articles depuis le catalogue. Votre panier est sauvegarde sur votre compte."
            action={{ href: "/produits", label: "Explorer les produits" }}
          />
        ) : null}

        {enriched.length ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_min(100%,320px)] lg:items-start">
            <div className="mx-auto w-full max-w-xl space-y-3 lg:mx-0">
              {enriched.map((item) => (
                <RaCard key={item.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3" padding="p-4">
                  <div className="flex min-w-0 flex-1 gap-3">
                    <CartLineThumbnail imageUrl={item.imageUrl} alt={item.product.name} />
                    <div className="min-w-0">
                      <h2 className="font-bold text-foreground">{item.product.name}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">{item.product.city}</p>
                      <p className="mt-2 text-base font-black tabular-nums text-brand">
                        {item.product.price_cfa.toLocaleString("fr-FR")} FCFA
                        <span className="ml-1 text-xs font-semibold text-muted-foreground">/ unite</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <div className={cartQtyStepperWrapClass} role="group" aria-label="Quantité">
                      <form action={updateCartItemQuantityAction} className="contents">
                        <input type="hidden" name="cart_id" value={item.id} />
                        <input type="hidden" name="quantity" value={item.quantity - 1} />
                        <button
                          type="submit"
                          disabled={item.quantity <= 1}
                          className={cartQtyStepperBtnClass}
                          aria-label="Diminuer la quantité"
                        >
                          <Minus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                        </button>
                      </form>
                      <span className="min-w-[2rem] px-1 text-center text-sm font-black tabular-nums text-foreground">{item.quantity}</span>
                      <form action={updateCartItemQuantityAction} className="contents">
                        <input type="hidden" name="cart_id" value={item.id} />
                        <input type="hidden" name="quantity" value={item.quantity + 1} />
                        <button
                          type="submit"
                          disabled={item.product.stock_quantity <= 0 || item.quantity >= item.product.stock_quantity}
                          className={cartQtyStepperBtnClass}
                          aria-label="Augmenter la quantité"
                        >
                          <Plus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                        </button>
                      </form>
                    </div>
                    <form action={removeFromCartAction}>
                      <input type="hidden" name="cart_id" value={item.id} />
                      <button type="submit" className={`${btnDangerOutlineClass} gap-1.5 px-3`}>
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        Retirer
                      </button>
                    </form>
                  </div>
                </RaCard>
              ))}
            </div>

            <aside className="lg:sticky lg:top-24">
              <RaCard padding="p-6">
                <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Resume</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {enriched.map((line) => (
                    <div key={line.id} className="relative">
                      <CartLineThumbnail
                        imageUrl={line.imageUrl}
                        alt={line.product.name}
                        className="h-11 w-11 shrink-0 rounded-lg ring-1 ring-orange-100/80"
                      />
                      <span className="absolute -bottom-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-brand-contrast shadow-sm ring-2 ring-card">
                        {line.quantity}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 space-y-3 text-sm">
                  <p className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span className="font-semibold tabular-nums">{subtotal.toLocaleString("fr-FR")} FCFA</span>
                  </p>
                  <p className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Livraison</span>
                    <span className="font-semibold tabular-nums">{deliveryFee.toLocaleString("fr-FR")} FCFA</span>
                  </p>
                  <div className="border-t border-border pt-3">
                    <p className="flex justify-between gap-4 text-base font-black">
                      <span>Total</span>
                      <span className="tabular-nums text-brand">{total.toLocaleString("fr-FR")} FCFA</span>
                    </p>
                  </div>
                </div>
                <Link href="/commande" className={`${btnPrimaryClass} mt-6 w-full`}>
                  Passer la commande
                </Link>
                <p className="mt-3 text-center text-[11px] text-muted-foreground">
                  Paiement en espèces à la livraison, lorsque le livreur vous remet la commande.
                </p>
              </RaCard>
            </aside>
          </div>
        ) : null}
      </div>
    </PageShell>
  );
}
