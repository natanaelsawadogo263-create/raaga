"use client";

import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  MapPin,
  Minus,
  Plus,
  RotateCw,
  Trash2,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import type { CartApiResponse } from "@/app/api/cart/route";
import { removeFromCartAction, updateCartItemQuantityAction } from "@/app/actions";
import { useCustomerCart } from "@/components/customer-cart-context";
import { CartLineThumbnail } from "@/components/cart-line-thumbnail";
import { IconCartPremium, IconDismiss } from "@/components/cart-drawer-icons";
import { getGuestCartLines, RAAGA_GUEST_CART_CHANGED, setGuestCartLines } from "@/lib/guest-cart";
import {
  btnDangerOutlineClass,
  cartQtyStepperBtnClass,
  cartQtyStepperWrapClass,
} from "@/components/raaga/page-shell";

async function fetchCartPayload(): Promise<CartApiResponse> {
  const res = await fetch("/api/cart", { credentials: "same-origin" });
  if (!res.ok) {
    throw new Error("fetch");
  }
  const json = (await res.json()) as CartApiResponse;
  if (json.guest) {
    const lines = getGuestCartLines();
    if (!lines.length) {
      return { items: [], subtotal: 0, deliveryFee: 0, total: 0, guest: true };
    }
    const preview = await fetch("/api/cart/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ lines }),
    });
    if (!preview.ok) {
      throw new Error("fetch");
    }
    return (await preview.json()) as CartApiResponse;
  }
  return json;
}

type CartDrawerContextValue = {
  openCart: () => void;
  closeCart: () => void;
  isOpen: boolean;
};

const CartDrawerContext = createContext<CartDrawerContextValue | null>(null);

export function useCartDrawer() {
  const ctx = useContext(CartDrawerContext);
  if (!ctx) {
    throw new Error("useCartDrawer must be used within CartDrawerProvider");
  }
  return ctx;
}

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function CartLineSkeleton() {
  return (
    <div className="flex gap-3.5 rounded-2xl border border-border/50 bg-card/90 p-3.5 shadow-sm">
      <div className="h-14 w-14 shrink-0 animate-pulse rounded-xl bg-gradient-to-br from-muted to-muted/40" />
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
        <div className="h-3.5 w-[72%] animate-pulse rounded-md bg-muted/90" />
        <div className="h-3 w-[40%] animate-pulse rounded-md bg-muted/70" />
        <div className="mt-1 h-4 w-[52%] animate-pulse rounded-md bg-muted/60" />
      </div>
    </div>
  );
}

function CartDrawerPanel() {
  const { isOpen, closeCart } = useCartDrawer();
  const { isCustomer } = useCustomerCart();
  const router = useRouter();
  const mounted = useIsClient();
  const [data, setData] = useState<CartApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);
  const [pendingLineId, setPendingLineId] = useState<string | null>(null);

  useEffect(() => {
    const bump = () => setFetchKey((k) => k + 1);
    window.addEventListener(RAAGA_GUEST_CART_CHANGED, bump);
    return () => window.removeEventListener(RAAGA_GUEST_CART_CHANGED, bump);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    let cancelled = false;
    startTransition(() => {
      setLoading(true);
      setError(null);
    });
    fetchCartPayload()
      .then((json) => {
        if (!cancelled) {
          setData(json);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setData(null);
          setError("Impossible de charger le panier.");
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
  }, [isOpen, fetchKey]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeCart();
      }
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, closeCart]);

  const itemCount = data?.items.length ?? 0;
  const itemLabel = itemCount === 1 ? "article" : "articles";
  const mutateLineQuantity = useCallback(
    async (line: NonNullable<CartApiResponse["items"]>[number], nextRawQuantity: number) => {
      const nextQuantity = Math.max(0, Math.floor(nextRawQuantity));
      setPendingLineId(line.id);
      setError(null);
      try {
        if (isCustomer) {
          const fd = new FormData();
          fd.set("cart_id", line.id);
          if (nextQuantity <= 0) {
            await removeFromCartAction(fd);
          } else {
            fd.set("quantity", String(nextQuantity));
            await updateCartItemQuantityAction(fd);
          }
        } else {
          const lines = getGuestCartLines();
          const nextLines = nextQuantity <= 0
            ? lines.filter((l) => l.product_id !== line.product_id)
            : lines.some((l) => l.product_id === line.product_id)
              ? lines.map((l) => (l.product_id === line.product_id ? { ...l, quantity: nextQuantity } : l))
              : [...lines, { product_id: line.product_id, quantity: nextQuantity }];
          setGuestCartLines(nextLines);
        }
        router.refresh();
        setFetchKey((k) => k + 1);
      } catch {
        setError("Impossible de mettre a jour la quantite.");
      } finally {
        setPendingLineId(null);
      }
    },
    [isCustomer, router],
  );

  if (!mounted) {
    return null;
  }

  return createPortal(
    <>
      <div
        className={`fixed inset-0 z-[10020] backdrop-blur-[2px] transition-[opacity,visibility] duration-300 ease-out ${
          isOpen ? "visible bg-black/50 opacity-100" : "invisible bg-black/50 opacity-0 pointer-events-none"
        }`}
        aria-hidden={!isOpen}
        onClick={closeCart}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Votre panier"
        className={`fixed inset-y-0 right-0 z-[10021] flex w-[min(100vw,28rem)] max-w-full flex-col border-l border-border/80 bg-gradient-to-b from-card via-card to-background shadow-[0_0_0_1px_rgba(0,0,0,0.03),-24px_0_48px_-12px_rgba(0,0,0,0.18)] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
      >
        {/* En-tête */}
        <header className="shrink-0 border-b border-border/70 bg-card/95 px-5 pb-4 pt-5 backdrop-blur-md">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3.5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/15 via-amber-400/10 to-orange-600/5 text-brand shadow-inner shadow-orange-500/10 ring-1 ring-orange-500/15">
                <IconCartPremium className="h-6 w-6" />
              </span>
              <div className="min-w-0 pt-0.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand/90">Panier</p>
                <h2 className="mt-0.5 text-lg font-black tracking-tight text-foreground">Votre sélection</h2>
                {!loading && data?.items.length ? (
                  <p className="mt-1 text-sm font-medium text-muted-foreground">
                    {itemCount} {itemLabel}
                    <span className="mx-1.5 text-border">·</span>
                    <span className="tabular-nums text-foreground/90">
                      {data.total.toLocaleString("fr-FR")} FCFA
                    </span>
                  </p>
                ) : !loading ? (
                  <p className="mt-1 text-sm text-muted-foreground">Prêt quand vous l’êtes.</p>
                ) : (
                  <p className="mt-1 h-4 w-40 animate-pulse rounded bg-muted/80" aria-hidden />
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={closeCart}
              aria-label="Fermer le panier"
              className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/90 bg-background text-muted-foreground shadow-sm transition hover:border-border hover:bg-muted/80 hover:text-foreground active:scale-[0.97]"
            >
              <IconDismiss className="h-[18px] w-[18px] transition group-hover:rotate-90" />
            </button>
          </div>
        </header>

        {/* Corps */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-5 py-5">
          {loading ? (
            <div className="flex flex-col gap-3" aria-busy="true" aria-live="polite">
              <CartLineSkeleton />
              <CartLineSkeleton />
              <CartLineSkeleton />
              <p className="sr-only">Chargement du panier…</p>
            </div>
          ) : error ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-5 px-2 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground">
                <ShieldCheck className="h-8 w-8" strokeWidth={1.35} aria-hidden />
              </span>
              <div>
                <p className="text-base font-semibold text-foreground">Impossible de charger</p>
                <p className="mt-2 text-sm text-muted-foreground">{error}</p>
              </div>
              <button
                type="button"
                onClick={() => setFetchKey((k) => k + 1)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-semibold text-foreground shadow-sm transition hover:border-brand/35 hover:bg-orange-50/40 active:scale-[0.99]"
              >
                <RotateCw className="h-4 w-4" strokeWidth={2} aria-hidden />
                Réessayer
              </button>
            </div>
          ) : !data?.items.length ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-6 px-2 text-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400/25 to-amber-300/10 blur-xl" aria-hidden />
                <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-50 to-amber-50 ring-1 ring-orange-100/80">
                  <Sparkles className="h-9 w-9 text-brand" strokeWidth={1.35} aria-hidden />
                </span>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">Panier vide</p>
                <p className="mt-2 max-w-[280px] text-sm leading-relaxed text-muted-foreground">
                  Parcourez le catalogue et ajoutez des articles — nous les regrouperons ici.
                </p>
              </div>
              <div className="flex w-full max-w-xs flex-col gap-2">
                <Link
                  href="/produits"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-bold text-brand-contrast shadow-md shadow-orange-500/25 transition hover:brightness-105 active:scale-[0.99]"
                  onClick={closeCart}
                >
                  Explorer le catalogue
                  <ArrowRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                </Link>
                <button
                  type="button"
                  onClick={closeCart}
                  className="text-sm font-semibold text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
                >
                  Continuer sur cette page
                </button>
              </div>
            </div>
          ) : (
            <>
              <ul className="flex flex-col gap-3">
                {data.items.map((item) => (
                  <li key={item.id}>
                    <article className="relative rounded-2xl border border-border/55 bg-card/95 p-3.5 pr-3 shadow-sm ring-1 ring-black/[0.02] transition hover:border-border hover:shadow-md hover:shadow-orange-500/[0.06]">
                      <button
                        type="button"
                        className="absolute right-2 top-2 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-red-200/90 bg-white text-red-600 shadow-sm transition active:scale-95 active:bg-red-50 disabled:opacity-50"
                        onClick={() => mutateLineQuantity(item, 0)}
                        disabled={pendingLineId === item.id}
                        aria-label={`Retirer ${item.name} du panier`}
                      >
                        <Trash2 className="h-5 w-5" strokeWidth={2} aria-hidden />
                      </button>

                      <div className="flex gap-3.5 pr-10">
                        <CartLineThumbnail imageUrl={item.image_url ?? null} alt={item.name} />
                        <div className="min-w-0 flex-1">
                          <h3 className="line-clamp-2 pr-1 text-[15px] font-bold leading-snug tracking-tight text-foreground">
                            {item.name}
                          </h3>
                          <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 shrink-0 opacity-70" strokeWidth={2} aria-hidden />
                            <span className="truncate">{item.city}</span>
                          </p>
                          <div className="mt-3 flex items-end justify-between gap-3">
                            <div className="inline-flex items-center gap-2">
                              <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Qte</span>
                              <div className={cartQtyStepperWrapClass} role="group" aria-label="Quantité">
                                <button
                                  type="button"
                                  className={cartQtyStepperBtnClass}
                                  onClick={() => mutateLineQuantity(item, item.quantity - 1)}
                                  disabled={pendingLineId === item.id}
                                  aria-label={item.quantity <= 1 ? "Retirer du panier" : "Diminuer la quantité"}
                                >
                                  <Minus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                                </button>
                                <span className="min-w-[2rem] px-1 text-center text-sm font-black tabular-nums text-foreground">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  className={cartQtyStepperBtnClass}
                                  onClick={() => mutateLineQuantity(item, item.quantity + 1)}
                                  disabled={
                                    pendingLineId === item.id ||
                                    (item.stock_quantity > 0 && item.quantity >= item.stock_quantity)
                                  }
                                  aria-label="Augmenter la quantité"
                                >
                                  <Plus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                                </button>
                              </div>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-[11px] font-medium tabular-nums text-muted-foreground">
                                {item.price_cfa.toLocaleString("fr-FR")} FCFA / u.
                              </p>
                              <p className="mt-0.5 text-base font-black tabular-nums tracking-tight text-brand">
                                {item.lineTotal.toLocaleString("fr-FR")}{" "}
                                <span className="text-xs font-bold text-brand/85">FCFA</span>
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            className={`${btnDangerOutlineClass} mt-3 w-full min-h-11 gap-2 text-sm`}
                            onClick={() => mutateLineQuantity(item, 0)}
                            disabled={pendingLineId === item.id}
                          >
                            <Trash2 className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                            Retirer du panier
                          </button>
                        </div>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>

              <section className="mt-5 rounded-2xl border border-border/60 bg-gradient-to-b from-muted/30 to-card p-4 shadow-sm ring-1 ring-black/[0.02]">
                <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-background text-foreground shadow-sm ring-1 ring-border/60">
                    <Truck className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                  </span>
                  Récapitulatif
                </h3>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Sous-total</dt>
                    <dd className="font-semibold tabular-nums text-foreground">
                      {data.subtotal.toLocaleString("fr-FR")} FCFA
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="flex items-center gap-1.5 text-muted-foreground">
                      Livraison
                      {!data.deliveryLabel ? (
                        <span className="rounded bg-muted px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          estimée
                        </span>
                      ) : null}
                    </dt>
                    <dd
                      className={
                        data.deliveryLabel
                          ? "max-w-[58%] text-right text-[11px] font-semibold leading-snug text-amber-900"
                          : "font-semibold tabular-nums text-foreground"
                      }
                    >
                      {data.deliveryLabel ?? `${data.deliveryFee.toLocaleString("fr-FR")} FCFA`}
                    </dd>
                  </div>
                  <div className="border-t border-border/80 pt-3">
                    <div className="flex justify-between gap-4 text-base">
                      <dt className="font-bold text-foreground">Total</dt>
                      <dd className="font-black tabular-nums text-brand">{data.total.toLocaleString("fr-FR")} FCFA</dd>
                    </div>
                  </div>
                </dl>
              </section>

              <p className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-200/80 bg-emerald-50/50 px-3 py-2.5 text-xs leading-relaxed text-emerald-900/85">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2} aria-hidden />
                <span>
                  {isCustomer
                    ? "Paiement en espèces à la livraison — vous réglerez au moment où le livreur vous remet la commande."
                    : "Connectez-vous pour finaliser la commande. Votre panier est conservé sur cet appareil."}
                </span>
              </p>
            </>
          )}
        </div>

        {/* Pied — actions principales */}
        {data?.items.length ? (
          <footer className="shrink-0 space-y-3 border-t border-border/70 bg-card/98 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md">
            <Link
              href={isCustomer ? "/commande" : "/connexion?next=%2Fcommande"}
              className="group flex min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-bold text-brand-contrast shadow-lg shadow-orange-500/30 transition hover:brightness-[1.03] active:scale-[0.99]"
              onClick={closeCart}
            >
              {isCustomer ? "Commander" : "Se connecter pour commander"}
              <ArrowRight
                className="h-4 w-4 transition group-hover:translate-x-0.5"
                strokeWidth={2.5}
                aria-hidden
              />
            </Link>
            <Link
              href="/panier"
              className="flex min-h-11 w-full items-center gap-2 rounded-xl border border-border/90 bg-background px-4 text-sm font-semibold text-foreground shadow-sm transition hover:border-brand/30 hover:bg-orange-50/35 active:scale-[0.99]"
              onClick={closeCart}
            >
              <span className="min-w-0 flex-1 text-left leading-snug">
                Quantités & détails
                <span className="mt-0.5 block text-xs font-medium text-muted-foreground">Page panier complète</span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={2} aria-hidden />
            </Link>
          </footer>
        ) : null}
      </div>
    </>,
    document.body,
  );
}

export function CartDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({
      openCart,
      closeCart,
      isOpen,
    }),
    [openCart, closeCart, isOpen],
  );

  return (
    <CartDrawerContext.Provider value={value}>
      {children}
      <CartDrawerPanel />
    </CartDrawerContext.Provider>
  );
}
