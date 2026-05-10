import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  Bike,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Radio,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import { AdminLivreursListClient } from "@/components/admin/admin-livreurs-list-client";
import { requireRole } from "@/lib/auth-guards";
import { fetchAdminDriversList } from "@/lib/admin/data";
import { parseAdminFlash } from "@/lib/admin/flash";

export const metadata: Metadata = {
  title: "Livreurs",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type KpiTone = "slate" | "amber" | "emerald" | "sky";

const toneStyles: Record<KpiTone, { card: string; iconWrap: string; value: string }> = {
  slate: {
    card: "border-slate-200/80",
    iconWrap: "bg-slate-100 text-slate-700",
    value: "text-slate-900",
  },
  amber: {
    card: "border-amber-200/80",
    iconWrap: "bg-amber-100 text-amber-700",
    value: "text-amber-900",
  },
  emerald: {
    card: "border-emerald-200/80",
    iconWrap: "bg-emerald-100 text-emerald-700",
    value: "text-emerald-900",
  },
  sky: {
    card: "border-sky-200/80",
    iconWrap: "bg-sky-100 text-sky-700",
    value: "text-sky-900",
  },
};

function KpiCard({
  label,
  value,
  hint,
  Icon,
  tone,
}: {
  label: string;
  value: number;
  hint?: string;
  Icon: typeof Users;
  tone: KpiTone;
}) {
  const t = toneStyles[tone];
  return (
    <div className={`rounded-2xl border bg-white p-3.5 shadow-sm sm:p-4 ${t.card}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
        <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${t.iconWrap}`}>
          <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
        </span>
      </div>
      <p className={`mt-2 text-2xl font-black tabular-nums sm:text-3xl ${t.value}`}>
        {value.toLocaleString("fr-FR")}
      </p>
      {hint ? <p className="mt-0.5 text-[11px] text-slate-500">{hint}</p> : null}
    </div>
  );
}

export default async function AdminLivreursPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const { supabase } = await requireRole(["admin", "super_admin"]);
  const { drivers, error: fetchError } = await fetchAdminDriversList(supabase);
  const flash = parseAdminFlash(sp);

  const total = drivers.length;
  const pending = drivers.filter((d) => d.review_status === "pending").length;
  const approved = drivers.filter((d) => d.review_status === "approved").length;
  const rejected = drivers.filter((d) => d.review_status === "rejected").length;
  const inactive = drivers.filter((d) => !d.profile_is_active).length;
  const onlineNow = drivers.filter(
    (d) => d.review_status === "approved" && d.profile_is_active && d.is_available,
  ).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-[#FF7A00] hover:underline"
          >
            <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
            Tableau de bord
          </Link>
          <h1 className="mt-1.5 flex items-center gap-2 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#FF7A00] ring-1 ring-orange-200">
              <Bike className="h-5 w-5" strokeWidth={2} aria-hidden />
            </span>
            Livreurs
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Approuvez, suivez et pilotez l&apos;équipe de livraison Raaga.
          </p>
        </div>

        <div className="hidden items-center gap-2 self-start rounded-2xl border border-emerald-200 bg-emerald-50/70 px-3 py-2 sm:flex">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <p className="text-xs font-bold text-emerald-900">
            {onlineNow} en ligne / {approved} approuvé{approved > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {fetchError ? (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>Erreur chargement : {fetchError}</span>
        </div>
      ) : null}
      {flash.error ? (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{flash.error}</span>
        </div>
      ) : null}
      {flash.ok ? (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{flash.ok}</span>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard label="Total" value={total} Icon={Users} tone="slate" />
        <KpiCard label="En attente" value={pending} Icon={Clock} tone="amber" />
        <KpiCard label="Approuvés" value={approved} Icon={ShieldCheck} tone="emerald" />
        <KpiCard label="En ligne" value={onlineNow} Icon={Radio} tone="sky" hint="Disponibles maintenant" />
        <KpiCard
          label="Refusés / désactivés"
          value={rejected + inactive}
          Icon={XCircle}
          tone="slate"
        />
      </div>

      <AdminLivreursListClient drivers={drivers} />
    </div>
  );
}
