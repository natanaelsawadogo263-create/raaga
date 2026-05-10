import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  ChevronLeft,
  MapPin,
  Phone,
  Power,
  ShieldCheck,
  Star,
  Wallet,
  XCircle,
} from "lucide-react";
import { setDriverAvailableAction } from "@/app/admin/actions/drivers";
import { AdminDriverRowActions } from "@/components/admin/admin-driver-row-actions";
import { requireRole } from "@/lib/auth-guards";
import { fetchAdminDriverByUserId } from "@/lib/admin/data";
import { formatCFA, formatOrderDate } from "@/lib/admin/format";
import { parseAdminFlash } from "@/lib/admin/flash";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type PageProps = {
  params: Promise<{ userId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function docCard(label: string, url: string | null) {
  if (!url) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-4 text-center">
        <p className="text-xs font-bold text-slate-700">{label}</p>
        <p className="mt-1 text-[11px] text-slate-400">Non fourni</p>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-slate-700">{label}</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-bold text-[#FF7A00] hover:underline"
        >
          Ouvrir
        </a>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt=""
        className="mt-2 h-40 w-full rounded-lg object-cover ring-1 ring-slate-200"
      />
    </div>
  );
}

function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

function reviewBadgeClass(status: "pending" | "approved" | "rejected") {
  if (status === "pending") return "bg-amber-100 text-amber-800 ring-1 ring-amber-200";
  if (status === "approved") return "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200";
  return "bg-rose-100 text-rose-800 ring-1 ring-rose-200";
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { userId } = await params;
  return { title: `Livreur ${userId.slice(0, 8)}…` };
}

export default async function AdminLivreurDetailPage({ params, searchParams }: PageProps) {
  const { userId } = await params;
  if (!UUID_RE.test(userId)) {
    notFound();
  }

  const sp = await searchParams;
  const { supabase } = await requireRole(["admin", "super_admin"]);
  const { driver, error } = await fetchAdminDriverByUserId(supabase, userId);
  const flash = parseAdminFlash(sp);

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
        Erreur : {error}
      </div>
    );
  }
  if (!driver) {
    notFound();
  }

  const name = `${driver.first_name} ${driver.last_name}`.trim();
  const returnPath = `/admin/livreurs/${userId}`;
  const reviewFr =
    driver.review_status === "pending"
      ? "En attente"
      : driver.review_status === "approved"
        ? "Approuvé"
        : "Refusé";

  const isOnline =
    driver.review_status === "approved" && driver.profile_is_active && driver.is_available;

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/livreurs"
          className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-[#FF7A00] hover:underline"
        >
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
          Livreurs
        </Link>
      </div>

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

      {/* Hero clean : pas de chevauchement, layout horizontal aéré */}
      <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200 sm:h-24 sm:w-24">
              {driver.avatar_url ? (
                <Image
                  src={driver.avatar_url}
                  alt={name}
                  fill
                  sizes="96px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 text-2xl font-black text-[#FF7A00]">
                  {initials(name)}
                </span>
              )}
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full ring-2 ring-white ${
                  isOnline ? "bg-emerald-500" : "bg-slate-300"
                }`}
                title={isOnline ? "En ligne" : "Hors ligne"}
                aria-label={isOnline ? "En ligne" : "Hors ligne"}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#FF7A00]">
                Fiche livreur
              </p>
              <h1 className="mt-0.5 truncate text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                {name}
              </h1>
              <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-slate-700">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
                <span className="tabular-nums">
                  {driver.average_rating != null
                    ? Number(driver.average_rating).toFixed(1)
                    : "—"}
                </span>
                <span className="text-xs font-medium text-slate-400">/ 5</span>
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${reviewBadgeClass(
                    driver.review_status,
                  )}`}
                >
                  <ShieldCheck className="h-3 w-3" strokeWidth={2.25} aria-hidden />
                  {reviewFr}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    driver.profile_is_active
                      ? "bg-sky-50 text-sky-800 ring-1 ring-sky-200"
                      : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                  }`}
                >
                  <Power className="h-3 w-3" strokeWidth={2.25} aria-hidden />
                  {driver.profile_is_active ? "Compte actif" : "Compte désactivé"}
                </span>
                {driver.review_status === "approved" ? (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      driver.is_available
                        ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
                        : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        driver.is_available ? "bg-emerald-500" : "bg-slate-400"
                      }`}
                      aria-hidden
                    />
                    {driver.is_available ? "Disponible" : "Hors ligne"}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
            <AdminDriverRowActions
              userId={driver.user_id}
              name={name}
              reviewStatus={driver.review_status}
              profileIsActive={driver.profile_is_active}
              returnPath={returnPath}
              hideView
            />
          </div>
        </div>
      </section>

      {/* Layout : pieces / résumé */}
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Pièces &amp; photos</h2>
            <span className="text-[11px] font-semibold text-slate-500">
              Vérifiez l&apos;identité avant approbation.
            </span>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {docCard("Pièce d’identité (recto)", driver.id_card_front_url)}
            {docCard("Pièce d’identité (verso)", driver.id_card_back_url)}
            {docCard("Photo de la plaque", driver.plate_photo_url)}
            {docCard("Photo du visage", driver.face_photo_url)}
          </div>
        </article>

        <aside className="space-y-4">
          <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900">Coordonnées</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-center gap-2 text-slate-800">
                <Phone className="h-4 w-4 shrink-0 text-[#FF7A00]" aria-hidden />
                <a
                  href={`tel:${driver.phone.replace(/\s/g, "")}`}
                  className="font-semibold hover:underline"
                >
                  {driver.phone}
                </a>
              </li>
              <li className="flex items-start gap-2 text-slate-800">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#FF7A00]" aria-hidden />
                <span className="font-semibold">
                  {driver.city}
                  {driver.district ? ` · ${driver.district}` : ""}
                  {driver.sector ? ` · ${driver.sector}` : ""}
                </span>
              </li>
            </ul>
          </article>

          <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900">Portefeuille &amp; activité</h2>
            <dl className="mt-3 space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <dt className="inline-flex items-center gap-1 text-slate-500">
                  <Wallet className="h-3.5 w-3.5" aria-hidden />
                  Disponible
                </dt>
                <dd className="font-bold text-emerald-700">
                  {formatCFA(driver.wallet_balance_cfa)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-500">En attente</dt>
                <dd className="font-semibold text-slate-900">
                  {formatCFA(driver.wallet_pending_cfa)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-500">E-mail vérifié</dt>
                <dd className="font-semibold text-slate-900">
                  {driver.email_verified ? "Oui" : "Non"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-500">Inscrit</dt>
                <dd className="font-semibold text-slate-900">
                  {formatOrderDate(driver.created_at)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-500">Mis à jour</dt>
                <dd className="font-semibold text-slate-900">
                  {formatOrderDate(driver.updated_at)}
                </dd>
              </div>
            </dl>

            {driver.review_status === "approved" && driver.profile_is_active ? (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <p className="text-xs font-bold text-slate-700">Disponibilité mission</p>
                <form
                  action={setDriverAvailableAction}
                  className="mt-2 flex flex-wrap items-center gap-2"
                >
                  <input type="hidden" name="user_id" value={driver.user_id} />
                  <input type="hidden" name="return_path" value={returnPath} />
                  <input
                    type="hidden"
                    name="is_available"
                    value={driver.is_available ? "false" : "true"}
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    {driver.is_available ? "Disponible" : "Indisponible"}
                  </span>
                  <button
                    type="submit"
                    className="rounded-lg bg-[#FF7A00] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#e66e00]"
                  >
                    {driver.is_available ? "Passer indisponible" : "Passer disponible"}
                  </button>
                </form>
              </div>
            ) : null}
          </article>
        </aside>
      </div>
    </div>
  );
}
