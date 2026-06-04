import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  KeyRound,
  Package,
  Phone,
  ShoppingBag,
  Truck,
  User,
} from "lucide-react";
import { confirmOrderReceivedAction, reportOrderIssueAction } from "@/app/actions";
import {
  PageShell,
  RaCard,
  btnDangerOutlineClass,
  btnPrimaryClass,
  textareaClass,
} from "@/components/raaga/page-shell";
import { OrderDiscussionLivePanel } from "@/components/order-discussion-live";
import { HEAVY_DELIVERY_MESSAGE } from "@/lib/heavy-product";
import { fetchOrderDiscussionByOrderId } from "@/lib/order-discussion";
import { requireRole } from "@/lib/auth-guards";

export const dynamic = "force-dynamic";

const steps = [
  { key: "validated", label: "Commande validée" },
  { key: "awaiting_driver", label: "En attente d'un livreur" },
  { key: "accepted_by_driver", label: "Commande acceptée" },
  { key: "picked_up", label: "Colis récupéré" },
  { key: "in_delivery", label: "Livraison en cours" },
  { key: "delivery_declared", label: "Livraison déclarée" },
  { key: "secret_validated", label: "Code secret validé" },
  { key: "confirmed_by_customer", label: "Confirmée par vous" },
  { key: "delivered", label: "Livrée" },
];

type SuiviProductImage = { image_url: string; is_primary: boolean; sort_order: number };
type SuiviProduct = {
  id: string;
  name: string;
  product_images: SuiviProductImage[] | null;
} | null;

type SuiviOrderItem = {
  id: string;
  quantity: number;
  products: SuiviProduct | SuiviProduct[];
};

type SuiviOrderRow = {
  id: string;
  reference: string;
  driver_id: string | null;
  order_status: string;
  total_cfa: number;
  delivery_secret_code: string;
  has_heavy_items: boolean;
  created_at: string;
  order_items: SuiviOrderItem[] | null;
};

function normalizeProduct(raw: SuiviOrderItem["products"]): SuiviProduct {
  if (raw == null) return null;
  return Array.isArray(raw) ? raw[0] ?? null : raw;
}

function pickProductImageUrl(images: SuiviProductImage[] | null | undefined): string | null {
  if (!images?.length) return null;
  const sorted = [...images].sort((a, b) => {
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
    return a.sort_order - b.sort_order;
  });
  return sorted[0]?.image_url?.trim() || null;
}

/** Chiffres du code (4 cases type maquette). */
function confirmationDigits(code: string): string[] {
  const raw = code.replace(/\D/g, "").split("").slice(0, 4);
  while (raw.length < 4) raw.push("");
  return raw;
}

type SuiviPageProps = {
  searchParams: Promise<{ orderId?: string }>;
};

const ORDER_SELECT = `
  id,
  reference,
  driver_id,
  order_status,
  total_cfa,
  delivery_secret_code,
  has_heavy_items,
  created_at,
  order_items (
    id,
    quantity,
    products (
      id,
      name,
      product_images ( image_url, is_primary, sort_order )
    )
  )
`;

function IconTile({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/12 text-brand">
      {children}
    </span>
  );
}

export default async function SuiviPage({ searchParams }: SuiviPageProps) {
  const { orderId } = await searchParams;
  const { supabase, user } = await requireRole(["customer"]);

  const base = supabase.from("orders").select(ORDER_SELECT).eq("customer_id", user.id);
  const { data: rows } = orderId
    ? await base.eq("id", orderId).limit(1)
    : await base.order("created_at", { ascending: false }).limit(1);

  const order = (rows?.[0] as SuiviOrderRow | undefined) ?? null;

  const discussion = order ? await fetchOrderDiscussionByOrderId(supabase, order.id) : null;

  let suiviDriver: {
    first_name: string;
    last_name: string;
    phone: string;
    avatar_url: string | null;
  } | null = null;
  if (order?.driver_id) {
    const { data: dprof } = await supabase
      .from("user_profiles")
      .select("first_name, last_name, phone, avatar_url")
      .eq("id", order.driver_id)
      .maybeSingle();
    if (dprof) {
      suiviDriver = dprof;
    }
  }

  const rawIndex = order ? steps.findIndex((step) => step.key === order.order_status) : -1;
  const activeIndex = order ? (rawIndex >= 0 ? rawIndex : 0) : -1;
  const lines = order?.order_items ?? [];
  const digits = order ? confirmationDigits(order.delivery_secret_code) : [];

  return (
    <PageShell>
      <div className="bg-[#fcf9f5] pb-6 pt-3 dark:bg-background sm:pt-4">
        <div className="container-raaga mx-auto max-w-5xl space-y-3 sm:space-y-4">
          {order ? (
            <>
              {/* Articles + code */}
              <div
                className={`grid grid-cols-1 gap-3 lg:gap-4 ${
                  order.has_heavy_items ? "" : "lg:grid-cols-5"
                }`}
              >
                <RaCard
                  className={`rounded-2xl border-border/50 shadow-md ${order.has_heavy_items ? "" : "lg:col-span-3"}`}
                  padding="p-4 sm:p-5"
                >
                  <p className="mb-2 text-sm text-muted-foreground">
                    Réf.{" "}
                    <span className="font-mono font-bold tabular-nums text-foreground" translate="no">
                      {order.reference}
                    </span>
                  </p>
                  <div className="flex items-center gap-2">
                    <IconTile>
                      <ShoppingBag className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                    </IconTile>
                    <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                      Articles commandés
                    </h2>
                  </div>
                  <ul className="mt-3 space-y-3">
                    {lines.map((line) => {
                      const product = normalizeProduct(line.products);
                      const imgUrl = pickProductImageUrl(product?.product_images ?? null);
                      const name = product?.name?.trim() || "Produit";
                      const href = product?.id ? `/produits/${product.id}` : null;

                      return (
                        <li key={line.id} className="flex items-center gap-3">
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted/60 ring-1 ring-border/40">
                            {imgUrl ? (
                              <Image
                                src={imgUrl}
                                alt=""
                                fill
                                sizes="56px"
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center text-muted-foreground">
                                <Package className="h-6 w-6" strokeWidth={1.25} aria-hidden />
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            {href ? (
                              <Link href={href} className="font-semibold text-foreground hover:text-brand hover:underline">
                                {name}
                              </Link>
                            ) : (
                              <p className="font-semibold text-foreground">{name}</p>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </RaCard>

                {!order.has_heavy_items ? (
                  <RaCard className="rounded-2xl border-border/50 shadow-md lg:col-span-2" padding="p-4 sm:p-5">
                    <div className="flex items-center gap-2">
                      <IconTile>
                        <KeyRound className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                      </IconTile>
                      <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                        Code de confirmation
                      </h2>
                    </div>
                    <div className="mt-3 flex justify-center gap-2" translate="no">
                      {digits.map((ch, i) => (
                        <div
                          key={i}
                          className="flex h-12 w-10 items-center justify-center rounded-lg border border-border/70 bg-card text-lg font-black tabular-nums text-foreground shadow-sm sm:h-14 sm:w-12 sm:text-xl"
                        >
                          {ch || "—"}
                        </div>
                      ))}
                    </div>
                  </RaCard>
                ) : null}
              </div>

              {order.has_heavy_items ? (
                <RaCard className="rounded-2xl border-amber-200/60 shadow-md" padding="p-4 sm:p-5">
                  <p className="text-sm font-bold text-amber-950">Commande poids lourd</p>
                  <p className="mt-1 text-xs leading-relaxed text-amber-900/90 sm:text-sm">
                    {HEAVY_DELIVERY_MESSAGE}
                  </p>
                </RaCard>
              ) : null}

              {discussion ? (
                <OrderDiscussionLivePanel
                  discussionId={discussion.discussionId}
                  initialMessages={discussion.messages}
                  viewerUserId={user.id}
                  returnTo={orderId ? `/suivi?orderId=${order.id}` : "/suivi"}
                  title={
                    order.has_heavy_items
                      ? "Discussion avec Raaga"
                      : order.driver_id
                        ? "Discussion avec votre livreur"
                        : "Discussion livraison"
                  }
                  hint={
                    order.has_heavy_items
                      ? "Organisez la récupération ou la livraison spéciale avec l’équipe Raaga."
                      : order.driver_id
                        ? "Échangez avec votre livreur (adresse, créneau, instructions…)."
                        : "Vous pouvez écrire dès maintenant ; votre livreur répondra dès qu’il aura accepté la course."
                  }
                  placeholder={
                    order.has_heavy_items
                      ? "Ex. retrait en boutique, créneau souhaité…"
                      : "Ex. code portail, point de repère, créneau de disponibilité…"
                  }
                />
              ) : null}

              {suiviDriver ? (
                <RaCard className="rounded-2xl border-border/50 shadow-md" padding="p-4 sm:p-5">
                  <div className="flex items-center gap-2">
                    <IconTile>
                      <User className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                    </IconTile>
                    <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                      Votre livreur
                    </h2>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted/60 ring-1 ring-border/40">
                      {suiviDriver.avatar_url ? (
                        <Image
                          src={suiviDriver.avatar_url}
                          alt={`${suiviDriver.first_name} ${suiviDriver.last_name}`}
                          fill
                          sizes="56px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <User
                          className="h-7 w-7 text-muted-foreground"
                          strokeWidth={1.5}
                          aria-hidden
                        />
                      )}
                      <span
                        className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-background"
                        aria-hidden
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-bold text-foreground">
                        {suiviDriver.first_name} {suiviDriver.last_name}
                      </p>
                      <a
                        href={`tel:${suiviDriver.phone.replace(/\s/g, "")}`}
                        className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
                      >
                        <Phone className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                        {suiviDriver.phone}
                      </a>
                    </div>
                  </div>
                </RaCard>
              ) : null}

              {!order.has_heavy_items ? (
              <RaCard className="rounded-2xl border-border/50 shadow-md" padding="p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <IconTile>
                    <Truck className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                  </IconTile>
                  <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    Étapes de livraison
                  </h2>
                </div>
                <div className="mt-3 overflow-x-auto [-webkit-overflow-scrolling:touch]">
                  <ol
                    className="flex min-w-[52rem] items-start justify-between gap-0 pb-0.5 sm:min-w-full"
                    aria-label="Étapes de livraison"
                  >
                    {steps.map((step, index) => {
                      const past = Boolean(order && activeIndex > index);
                      const reached = Boolean(order && activeIndex >= index);
                      const lineLeftDone = Boolean(order && activeIndex >= index);
                      const lineRightDone = Boolean(order && activeIndex > index);
                      const isLast = index === steps.length - 1;

                      return (
                        <li key={step.key} className="relative flex min-w-0 flex-1 flex-col items-center px-0.5">
                          <div className="flex w-full items-center">
                            {index > 0 ? (
                              <span
                                aria-hidden
                                className={`min-w-2 flex-1 rounded-full ${lineLeftDone ? "h-1 bg-brand" : "h-0.5 bg-border"}`}
                              />
                            ) : (
                              <span className="min-w-2 flex-1" aria-hidden />
                            )}
                            <span
                              className={`relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                                reached
                                  ? "bg-brand text-brand-contrast shadow-md shadow-orange-500/25"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {past ? <Check className="h-4 w-4 stroke-[2.5]" aria-hidden /> : index + 1}
                            </span>
                            {!isLast ? (
                              <span
                                aria-hidden
                                className={`min-w-2 flex-1 rounded-full ${lineRightDone ? "h-1 bg-brand" : "h-0.5 bg-border"}`}
                              />
                            ) : (
                              <span className="min-w-2 flex-1" aria-hidden />
                            )}
                          </div>
                          <p
                            className={`mt-1.5 max-w-[6.5rem] text-center text-[10px] font-semibold leading-tight sm:max-w-none sm:text-[11px] ${
                              reached ? "text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            {step.label}
                          </p>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </RaCard>
              ) : null}

              {!order.has_heavy_items &&
              ["secret_validated", "delivery_declared"].includes(order.order_status) ? (
                <RaCard className="rounded-2xl border-border/50 shadow-md" padding="p-4 sm:p-5">
                  <p className="text-center text-base font-bold text-foreground">Confirmation finale</p>
                  <p className="mx-auto mt-1.5 max-w-lg text-center text-sm leading-relaxed text-muted-foreground">
                    Indiquez si vous avez bien recu votre colis. En cas de probleme, signalement au support.
                  </p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    <form action={confirmOrderReceivedAction}>
                      <input type="hidden" name="order_id" value={order.id} />
                      <button type="submit" className={btnPrimaryClass}>
                        Oui, j’ai recu le colis
                      </button>
                    </form>
                  </div>
                  <form action={reportOrderIssueAction} className="mx-auto mt-4 max-w-md space-y-2 border-t border-border/50 pt-4 text-left">
                    <input type="hidden" name="order_id" value={order.id} />
                    <label htmlFor="issue-msg" className="block text-xs font-semibold">
                      Decrivez le probleme
                    </label>
                    <textarea id="issue-msg" name="message" placeholder="Ex. colis endommage, article manquant…" className={textareaClass} />
                    <div className="flex justify-center pt-1">
                      <button type="submit" className={btnDangerOutlineClass}>
                        Non, je n’ai pas recu le colis
                      </button>
                    </div>
                  </form>
                </RaCard>
              ) : null}
            </>
          ) : (
            <RaCard className="rounded-2xl border-border/50 shadow-md" padding="p-8">
              <p className="text-center text-sm text-muted-foreground">Aucune commande trouvee pour ce compte.</p>
            </RaCard>
          )}
        </div>
      </div>
    </PageShell>
  );
}
