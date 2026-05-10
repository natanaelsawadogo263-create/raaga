import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  KeyRound,
  MapPin,
  Package,
  Phone,
  Store,
  User,
  XCircle,
} from "lucide-react";
import {
  declareDeliveryAction,
  markInDeliveryAction,
  markPickedUpAction,
  validateDeliverySecretAction,
} from "@/app/actions";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { SecretCodeInput } from "@/components/livreur/secret-code-input";
import { requireRole } from "@/lib/auth-guards";
import { paymentMethodLabel } from "@/lib/admin/order-labels";
import { formatCFA } from "@/lib/admin/format";

export const dynamic = "force-dynamic";

type LineItem = {
  id: string;
  quantity: number;
  unit_price_cfa: number;
  total_price_cfa: number;
  products: { name: string } | { name: string }[] | null;
  shops:
    | {
        name: string;
        city: string;
        district: string | null;
        sector: string | null;
        address: string | null;
        phone: string | null;
      }
    | {
        name: string;
        city: string;
        district: string | null;
        sector: string | null;
        address: string | null;
        phone: string | null;
      }[]
    | null;
};

function pickOne<T>(raw: T | T[] | null): T | null {
  if (!raw) return null;
  return Array.isArray(raw) ? (raw[0] ?? null) : raw;
}

function StepBadge({ active, done, label, num }: { active: boolean; done: boolean; label: string; num: number }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black ${
          done
            ? "bg-emerald-500 text-white"
            : active
              ? "bg-[#FF7A00] text-white shadow-md shadow-orange-500/25"
              : "bg-slate-200 text-slate-500"
        }`}
      >
        {done ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : num}
      </span>
      <span
        className={`text-[11px] font-bold ${
          done ? "text-emerald-700" : active ? "text-slate-900" : "text-slate-500"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

type CodeFlash = "invalid" | "missing" | "wrong_step" | "not_found" | "server_error";

const CODE_FLASH_LABEL: Record<CodeFlash, { title: string; body: string }> = {
  invalid: {
    title: "Code incorrect",
    body: "Les 4 chiffres saisis ne correspondent pas. La livraison n'est pas encore finalisée — demandez à nouveau le code au client puis réessayez.",
  },
  missing: {
    title: "Code manquant",
    body: "Saisissez les 4 chiffres affichés dans le suivi du client avant de valider.",
  },
  wrong_step: {
    title: "Étape incorrecte",
    body: "Vous devez d'abord déclarer la livraison avant de saisir le code.",
  },
  not_found: {
    title: "Commande introuvable",
    body: "Cette commande n'est plus accessible. Rafraîchissez la page.",
  },
  server_error: {
    title: "Erreur serveur",
    body: "Impossible d'enregistrer la validation pour le moment. Réessayez dans un instant.",
  },
};

type PageProps = {
  searchParams: Promise<{ code?: string }>;
};

export default async function LivreurEnCoursPage({ searchParams }: PageProps) {
  const { supabase, user } = await requireRole(["driver"]);
  const sp = await searchParams;
  const flash = (sp.code ?? "") as CodeFlash | "";

  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, reference, customer_id, order_status, city, district, sector, delivery_address, total_cfa, payment_method",
    )
    .eq("driver_id", user.id)
    .in("order_status", [
      "accepted_by_driver",
      "picked_up",
      "in_delivery",
      "delivery_declared",
    ])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!order) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-10 text-center shadow-sm">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Package className="h-7 w-7" strokeWidth={1.5} aria-hidden />
        </span>
        <p className="mt-3 text-sm font-bold text-slate-800">Aucune course active</p>
        <p className="mt-1 text-xs text-slate-500">
          Consultez les tâches disponibles et acceptez une livraison pour la voir dans cet écran.
        </p>
        <Link
          href="/livreur/taches"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#FF7A00] px-4 py-2 text-xs font-bold text-white shadow-md shadow-orange-500/25 hover:brightness-105"
        >
          <ClipboardList className="h-4 w-4" aria-hidden />
          Voir les tâches
        </Link>
      </div>
    );
  }

  const [{ data: customer }, { data: itemsRaw }] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("first_name, last_name, phone")
      .eq("id", order.customer_id)
      .maybeSingle(),
    supabase
      .from("order_items")
      .select(
        "id, quantity, unit_price_cfa, total_price_cfa, products ( name ), shops ( name, city, district, sector, address, phone )",
      )
      .eq("order_id", order.id),
  ]);

  const items = (itemsRaw ?? []) as unknown as LineItem[];

  const shopsMap = new Map<
    string,
    {
      name: string;
      city: string;
      district: string | null;
      sector: string | null;
      address: string | null;
      phone: string | null;
    }
  >();
  for (const it of items) {
    const s = pickOne(it.shops);
    if (s && !shopsMap.has(s.name)) {
      shopsMap.set(s.name, s);
    }
  }
  const shops = [...shopsMap.values()];

  const customerPhone = customer?.phone?.trim() ?? "";
  const status = order.order_status;
  /**
   * Note : dès que le code est validé (secret_validated), la course quitte cette page
   * et bascule en historique côté livreur. Cette page ne gère donc que les statuts
   * intermédiaires.
   */
  const isPickedUpDone =
    status === "picked_up" || status === "in_delivery" || status === "delivery_declared";
  const isInDeliveryDone = status === "in_delivery" || status === "delivery_declared";
  const isDeclaredDone = status === "delivery_declared";

  const stepHints: Record<string, string> = {
    accepted_by_driver:
      "Allez à la boutique récupérer le colis. Quand vous l'avez en main, marquez « Colis récupéré ».",
    picked_up:
      "Vous avez le colis. En route vers le client : marquez « En livraison » pour qu'il sache que vous arrivez.",
    in_delivery:
      "Vous êtes auprès du client. Cliquez « Déclarer la livraison » pour pouvoir saisir son code à 4 chiffres.",
    delivery_declared:
      "Demandez au client les 4 chiffres affichés dans son suivi, et saisissez-les ci-dessous pour clôturer.",
  };
  const currentStepLabel: Record<string, string> = {
    accepted_by_driver: "Étape 1/4 · Acceptée — en route boutique",
    picked_up: "Étape 2/4 · Colis récupéré — en route client",
    in_delivery: "Étape 3/4 · En livraison — auprès du client",
    delivery_declared: "Étape 4/4 · Livraison déclarée — code à valider",
  };

  type NextAction = {
    label: string;
    formAction: typeof markPickedUpAction;
    icon: React.ReactNode;
  } | null;
  const nextAction: NextAction =
    status === "accepted_by_driver"
      ? {
          label: "Marquer : colis récupéré",
          formAction: markPickedUpAction,
          icon: <Package className="h-5 w-5" aria-hidden />,
        }
      : status === "picked_up"
        ? {
            label: "Marquer : en livraison",
            formAction: markInDeliveryAction,
            icon: <ChevronRight className="h-5 w-5" aria-hidden />,
          }
        : status === "in_delivery"
          ? {
              label: "Déclarer la livraison",
              formAction: declareDeliveryAction,
              icon: <CheckCircle2 className="h-5 w-5" aria-hidden />,
            }
          : null;

  const flashLabel = flash ? (CODE_FLASH_LABEL[flash as CodeFlash] ?? null) : null;

  return (
    <div className="space-y-4">
      {flashLabel ? (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <XCircle className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-rose-900">{flashLabel.title}</p>
              <p className="mt-1 text-xs text-rose-900/80">{flashLabel.body}</p>
              {flash === "invalid" ? (
                <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-700">
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
                  La livraison n&apos;est pas encore finalisée.
                </p>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Référence</p>
            <p
              className="font-mono text-2xl font-black tabular-nums text-slate-900"
              translate="no"
            >
              #{order.reference}
            </p>
          </div>
          <OrderStatusBadge status={order.order_status} />
        </div>
        <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <p className="text-2xl font-black tabular-nums text-[#FF7A00]">
            {formatCFA(order.total_cfa)}
          </p>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
            {paymentMethodLabel(order.payment_method)}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-dashed border-slate-200 pt-4">
          <StepBadge num={1} done={isPickedUpDone} active={status === "accepted_by_driver"} label="Récupéré" />
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" aria-hidden />
          <StepBadge num={2} done={isInDeliveryDone} active={status === "picked_up"} label="En livraison" />
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" aria-hidden />
          <StepBadge num={3} done={isDeclaredDone} active={status === "in_delivery"} label="Déclarée" />
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" aria-hidden />
          <StepBadge num={4} done={false} active={status === "delivery_declared"} label="Code validé" />
        </div>
      </section>

      <section className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-white p-4 shadow-sm sm:p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#FF7A00]">
          {currentStepLabel[status] ?? "Étape en cours"}
        </p>
        <p className="mt-2 text-sm font-semibold text-slate-800">
          {stepHints[status] ?? "Suivez l'étape en cours."}
        </p>

        {nextAction ? (
          <form action={nextAction.formAction} className="mt-4">
            <input type="hidden" name="order_id" value={order.id} />
            <button
              type="submit"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#FF7A00] px-4 text-sm font-black text-white shadow-md shadow-orange-500/25 transition hover:brightness-105 sm:w-auto sm:px-6"
            >
              {nextAction.icon}
              {nextAction.label}
            </button>
          </form>
        ) : status === "delivery_declared" ? (
          <p className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-100 px-3 py-2 text-xs font-bold text-amber-900">
            <KeyRound className="h-4 w-4" aria-hidden />
            Saisissez le code à 4 chiffres ci-dessous pour clôturer.
          </p>
        ) : null}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
            <User className="h-4 w-4 text-[#FF7A00]" aria-hidden />
            Client
          </div>
          <p className="mt-2 text-base font-bold text-slate-900">
            {customer ? `${customer.first_name} ${customer.last_name}` : "—"}
          </p>
          {customerPhone ? (
            <a
              href={`tel:${customerPhone.replace(/\s/g, "")}`}
              className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-[#FF7A00] hover:underline"
            >
              <Phone className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
              {customerPhone}
            </a>
          ) : (
            <p className="mt-1 text-xs text-slate-500">Pas de téléphone renseigné</p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
            <MapPin className="h-4 w-4 text-[#FF7A00]" aria-hidden />
            Adresse de livraison
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-900">{order.delivery_address}</p>
          <p className="mt-1 text-xs text-slate-500">
            {order.city}, {order.district}, {order.sector}
          </p>
        </section>
      </div>

      {shops.length > 0 ? (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
            <Store className="h-4 w-4 text-[#FF7A00]" aria-hidden />
            Boutique{shops.length > 1 ? "s" : ""} à passer
          </div>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {shops.map((s) => (
              <li key={s.name} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <p className="text-sm font-bold text-slate-900">{s.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {s.city}
                  {s.district ? `, ${s.district}` : ""}
                  {s.sector ? `, ${s.sector}` : ""}
                </p>
                {s.address ? (
                  <p className="mt-0.5 text-xs text-slate-700">{s.address}</p>
                ) : null}
                {s.phone ? (
                  <a
                    href={`tel:${s.phone.replace(/\s/g, "")}`}
                    className="mt-1 inline-flex items-center gap-2 text-xs font-semibold text-[#FF7A00] hover:underline"
                  >
                    <Phone className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
                    {s.phone}
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {items.length > 0 ? (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
            <Package className="h-4 w-4 text-[#FF7A00]" aria-hidden />
            Articles à livrer
          </div>
          <ul className="mt-3 divide-y divide-slate-100">
            {items.map((it) => {
              const p = pickOne(it.products);
              const s = pickOne(it.shops);
              return (
                <li key={it.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">
                      {p?.name ?? "Article"}
                    </p>
                    {s ? (
                      <p className="truncate text-[11px] text-slate-500">{s.name}</p>
                    ) : null}
                  </div>
                  <p className="shrink-0 font-black tabular-nums text-slate-900">×{it.quantity}</p>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}


      <section className="rounded-2xl border border-orange-200 bg-orange-50/60 p-4 shadow-sm sm:p-5">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-[#FF7A00]">
          <KeyRound className="h-4 w-4" aria-hidden />
          Validation code secret
        </div>
        <p className="mt-2 text-sm text-slate-700">
          Demandez au client les <strong>4 chiffres</strong> affichés dans son suivi de commande,
          puis saisissez-les ici.
        </p>
        <form action={validateDeliverySecretAction} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <input type="hidden" name="order_id" value={order.id} />
          <div className="flex-1">
            <label
              htmlFor="secret_code"
              className="text-[11px] font-bold uppercase tracking-wide text-slate-700"
            >
              Code à 4 chiffres
            </label>
            <SecretCodeInput disabled={status !== "delivery_declared"} />
          </div>
          <button
            type="submit"
            disabled={status !== "delivery_declared"}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#FF7A00] px-5 text-sm font-bold text-white shadow-md shadow-orange-500/25 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            Valider le code
          </button>
        </form>
      </section>
    </div>
  );
}
