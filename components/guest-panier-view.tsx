"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { CartLineThumbnail } from "@/components/cart-line-thumbnail";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { CartApiResponse } from "@/app/api/cart/route";
import { GuestPanierLineQuantity } from "@/components/guest-panier-line-quantity";
import {
  EmptyState,
  PageHeader,
  PageShell,
  RaCard,
  btnDangerOutlineClass,
  btnPrimaryClass,
} from "@/components/raaga/page-shell";
import { CartDeliveryLine } from "@/components/cart-delivery-line";
import { PanierSkeleton } from "@/components/ui/product-grid-skeleton";
import { getGuestCartLines, setGuestCartLines, type GuestCartLine } from "@/lib/guest-cart";

export function GuestPanierView() {
  const router = useRouter();
  const [lines, setLines] = useState<GuestCartLine[]>([]);
  const [preview, setPreview] = useState<CartApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLines(getGuestCartLines());
  }, []);

  useEffect(() => {
    if (!lines.length) {
      setPreview({ items: [], subtotal: 0, deliveryFee: 0, total: 0, guest: true });
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch("/api/cart/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ lines }),
    })
      .then((r) => {
        if (!r.ok) {
          throw new Error("preview");
        }
        return r.json() as Promise<CartApiResponse>;
      })
      .then((json) => {
        if (!cancelled) {
          setPreview(json);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPreview(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [lines]);

  const persistLines = (next: GuestCartLine[]) => {
    setLines(next);
    setGuestCartLines(next);
    router.refresh();
  };

  const updateQuantity = (productId: string, rawQty: number) => {
    const qty = Math.floor(rawQty);
    if (!Number.isFinite(qty) || qty <= 0) {
      persistLines(lines.filter((l) => l.product_id !== productId));
      return;
    }
    persistLines(lines.map((l) => (l.product_id === productId ? { ...l, quantity: qty } : l)));
  };

  const removeLine = (productId: string) => {
    persistLines(lines.filter((l) => l.product_id !== productId));
  };

  const items = preview?.items ?? [];
  const subtotal = preview?.subtotal ?? 0;
  const deliveryFee = preview?.deliveryFee ?? 0;
  const deliveryLabel = preview?.deliveryLabel ?? null;
  const total = preview?.total ?? 0;

  return (
    <PageShell>
      <div className="container-raaga py-6 sm:py-10">
        <PageHeader
          eyebrow="Panier"
          title="Votre selection"
          description="Sans compte, votre panier reste sur cet appareil. Connectez-vous pour passer commande."
        />

        {loading ? <PanierSkeleton /> : null}

        {!loading && preview === null && lines.length > 0 ? (
          <p className="text-sm text-destructive">Impossible de charger les prix des articles. Réessayez dans un instant.</p>
        ) : null}

        {!loading && preview !== null && !items.length ? (
          <EmptyState
            title="Panier vide"
            description="Ajoutez des articles depuis le catalogue. Créez un compte ou connectez-vous au moment de la commande."
            action={{ href: "/produits", label: "Explorer les produits" }}
          />
        ) : null}

        {!loading && preview !== null && items.length ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_min(100%,320px)] lg:items-start">
            <div className="mx-auto w-full max-w-xl space-y-3 lg:mx-0">
              {items.map((item) => {
                const lineQty = lines.find((l) => l.product_id === item.product_id)?.quantity ?? item.quantity;
                return (
                  <RaCard key={item.product_id} className="relative flex flex-col gap-3" padding="p-4">
                    <button
                      type="button"
                      className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-red-200/90 bg-white text-red-600 shadow-sm active:bg-red-50"
                      onClick={() => removeLine(item.product_id)}
                      aria-label={`Retirer ${item.name} du panier`}
                    >
                      <Trash2 className="h-5 w-5" strokeWidth={2} aria-hidden />
                    </button>
                    <div className="flex min-w-0 flex-1 gap-3 pr-10">
                      <CartLineThumbnail imageUrl={item.image_url ?? null} alt={item.name} />
                      <div className="min-w-0">
                        <h2 className="font-bold text-foreground">{item.name}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">{item.city}</p>
                        <p className="mt-2 text-base font-black tabular-nums text-brand">
                          {item.price_cfa.toLocaleString("fr-FR")} FCFA
                          <span className="ml-1 text-xs font-semibold text-muted-foreground">/ unite</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex w-full shrink-0 flex-col gap-2">
                      <GuestPanierLineQuantity
                        productId={item.product_id}
                        quantity={lineQty}
                        stockQuantity={item.stock_quantity}
                        onChangeQuantity={updateQuantity}
                      />
                      <button
                        type="button"
                        className={`${btnDangerOutlineClass} min-h-11 w-full gap-2 text-sm`}
                        onClick={() => removeLine(item.product_id)}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                        Retirer du panier
                      </button>
                    </div>
                  </RaCard>
                );
              })}
            </div>

            <aside className="lg:sticky lg:top-24">
              <RaCard padding="p-6">
                <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Resume</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {items.map((line) => (
                    <div key={line.product_id} className="relative">
                      <CartLineThumbnail
                        imageUrl={line.image_url ?? null}
                        alt={line.name}
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
                  <CartDeliveryLine deliveryFee={deliveryFee} deliveryLabel={deliveryLabel} />
                  <div className="border-t border-border pt-3">
                    <p className="flex justify-between gap-4 text-base font-black">
                      <span>Total</span>
                      <span className="tabular-nums text-brand">{total.toLocaleString("fr-FR")} FCFA</span>
                    </p>
                  </div>
                </div>
                <Link href="/connexion?next=%2Fcommande" className={`${btnPrimaryClass} mt-6 flex w-full justify-center`}>
                  Se connecter pour commander
                </Link>
                <p className="mt-3 text-center text-[11px] text-muted-foreground">
                  Pas encore de compte ?{" "}
                  <Link href="/inscription-client" className="font-semibold text-brand underline-offset-4 hover:underline">
                    Inscription
                  </Link>
                </p>
              </RaCard>
            </aside>
          </div>
        ) : null}
      </div>
    </PageShell>
  );
}
