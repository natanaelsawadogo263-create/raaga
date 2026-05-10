"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { Check, Package, Pencil, ShoppingBag, User, X } from "lucide-react";
import { useAdminUi } from "@/components/admin/admin-ui-context";
import { reviewPendingDriverAction } from "@/app/admin/actions/drivers";
import type {
  AdminDashboardData,
  AdminDashboardDonutSlice,
  AdminDashboardRevenuePoint,
} from "@/lib/admin/dashboard-data";
import type { OrderStatus } from "@/lib/admin/order-labels";

function WalletIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={props.className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 7a2 2 0 0 1 2-2h11a2 2 0 0 1 0 4H5a2 2 0 0 0-2 2z" />
      <path d="M3 9v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H5" />
      <circle cx="16.5" cy="14" r="1" />
    </svg>
  );
}

const statIcons = [ShoppingBag, Package, User, WalletIcon] as const;

function statusToneClass(status: OrderStatus): string {
  if (status === "cancelled") return "bg-rose-100 text-rose-700";
  if (status === "problematic") return "bg-amber-100 text-amber-700";
  if (status === "delivered" || status === "confirmed_by_customer") return "bg-emerald-100 text-emerald-700";
  if (status === "validated" || status === "awaiting_driver") return "bg-amber-100 text-amber-700";
  return "bg-sky-100 text-sky-700";
}

function matches(q: string, ...parts: string[]) {
  const n = q.trim().toLowerCase();
  if (!n) return true;
  return parts.some((p) => String(p).toLowerCase().includes(n));
}

function formatRelativeFr(iso: string): string {
  const t = new Date(iso).getTime();
  const diff = Date.now() - t;
  const sec = Math.floor(diff / 1000);
  if (sec < 45) return "À l'instant";
  const min = Math.floor(sec / 60);
  if (min < 60) return `Il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Il y a ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `Il y a ${d} j`;
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}

type Props = {
  snapshot: AdminDashboardData | null;
  loadError: string | null;
  flash?: { ok?: string; error?: string };
};

export function AdminDashboardView({ snapshot, loadError, flash }: Props) {
  const { searchQuery } = useAdminUi();
  const [revenueRange, setRevenueRange] = useState<"7d" | "30d">("7d");
  const revenueSeries = revenueRange === "7d" ? (snapshot?.revenue7 ?? []) : (snapshot?.revenue30 ?? []);
  const gradientId = useId().replace(/:/g, "");

  const filteredOrders = useMemo(
    () =>
      (snapshot?.recentOrders ?? []).filter((row) =>
        matches(searchQuery, row.id, row.shortId, row.client, row.boutique, row.amount, row.statusLabel),
      ),
    [searchQuery, snapshot?.recentOrders],
  );

  const filteredDrivers = useMemo(
    () => (snapshot?.pendingDrivers ?? []).filter((d) => matches(searchQuery, d.name, d.city, d.user_id)),
    [snapshot?.pendingDrivers, searchQuery],
  );

  const filteredLowStock = useMemo(
    () => (snapshot?.lowStock ?? []).filter((p) => matches(searchQuery, p.name, p.boutique, String(p.stock))),
    [searchQuery, snapshot?.lowStock],
  );

  const filteredActivity = useMemo(
    () =>
      (snapshot?.activity ?? []).filter((a) =>
        matches(searchQuery, a.text, formatRelativeFr(a.atIso), a.atIso),
      ),
    [searchQuery, snapshot?.activity],
  );

  if (loadError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-900">
        <p className="font-bold">Impossible de charger le tableau de bord.</p>
        <p className="mt-2 text-rose-800">{loadError}</p>
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Aucune donnée disponible.
      </div>
    );
  }

  const { statCards, donutSlices, donutTotal, pendingDrivers } = snapshot;

  return (
    <>
      {flash?.error ? (
        <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{flash.error}</div>
      ) : null}
      {flash?.ok ? (
        <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{flash.ok}</div>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card, i) => {
          const Icon = statIcons[i] ?? ShoppingBag;
          return (
            <Link key={card.title} href={card.href} className="block transition hover:opacity-95">
              <article className="h-full rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:shadow-md">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-slate-500">{card.title}</p>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#FF7A00]">
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{card.value}</p>
                <p className="mt-1 text-xs font-semibold text-slate-600">{card.deltaLabel}</p>
              </article>
            </Link>
          );
        })}
      </section>

      <section className="mt-3 grid gap-3 lg:grid-cols-2 xl:grid-cols-[1.25fr_0.85fr_0.95fr]">
        <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-slate-900">Revenus (hors annulées)</h2>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setRevenueRange("7d")}
                className={`rounded-lg border px-2 py-1 text-xs font-semibold transition ${
                  revenueRange === "7d"
                    ? "border-[#FF7A00] bg-orange-50 text-[#FF7A00]"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                7 jours
              </button>
              <button
                type="button"
                onClick={() => setRevenueRange("30d")}
                className={`rounded-lg border px-2 py-1 text-xs font-semibold transition ${
                  revenueRange === "30d"
                    ? "border-[#FF7A00] bg-orange-50 text-[#FF7A00]"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                30 jours
              </button>
            </div>
          </div>
          <RevenueChart points={revenueSeries} gradientId={`rev-${gradientId}`} />
        </article>

        <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900">Commandes par statut (30 j.)</h2>
          <div className="mt-2 grid grid-cols-1 items-center gap-4 sm:grid-cols-[140px_1fr]">
            <DonutChart slices={donutSlices} total={donutTotal} />
            <ul className="space-y-2 text-xs">
              {donutSlices.length === 0 ? (
                <li className="text-slate-500">Aucune commande sur la période.</li>
              ) : (
                donutSlices.map((s) => (
                  <li key={s.label} className="flex items-center justify-between gap-2">
                    <span className="inline-flex min-w-0 items-center gap-2">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="truncate">{s.label}</span>
                    </span>
                    <span className="shrink-0 font-semibold">
                      {s.count}
                      {donutTotal > 0 ? ` (${Math.round((s.count / donutTotal) * 100)}%)` : ""}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm lg:col-span-2 xl:col-span-1">
          <h2 className="text-sm font-bold text-slate-900">Activité récente</h2>
          {filteredActivity.length === 0 ? (
            <p className="mt-3 text-xs text-slate-500">Aucun résultat pour « {searchQuery} ».</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {filteredActivity.map((item) => (
                <li key={item.id} className="rounded-xl bg-slate-50/80 p-2.5 text-xs ring-1 ring-slate-100">
                  <p className="font-semibold text-slate-800">{item.text}</p>
                  <p className="mt-1 text-slate-500">{formatRelativeFr(item.atIso)}</p>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <section className="mt-3 grid gap-3 xl:grid-cols-[1.45fr_1fr_0.85fr]">
        <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Commandes récentes</h2>
            <Link href="/admin/commandes" className="text-xs font-bold text-[#FF7A00] hover:underline">
              Voir tout
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="text-slate-500">
                <tr className="border-b border-slate-200">
                  <th className="py-2">Commande</th>
                  <th>Client</th>
                  <th>Boutique</th>
                  <th>Montant</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">
                      Aucune commande ne correspond à votre recherche.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((row) => (
                    <tr key={row.id} className="border-b border-slate-100">
                      <td className="py-2.5 font-bold">
                        <Link
                          href={`/admin/commandes/${row.id}`}
                          className="text-[#FF7A00] hover:underline"
                          title="Détail de la commande"
                        >
                          {row.shortId}
                        </Link>
                      </td>
                      <td>{row.client}</td>
                      <td>{row.boutique}</td>
                      <td>{row.amount}</td>
                      <td>
                        <span
                          className={`rounded-full px-2 py-1 text-[11px] font-bold ${statusToneClass(row.status)}`}
                        >
                          {row.statusLabel}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Demandes de livreurs</h2>
            <Link href="/admin/livreurs" className="text-xs font-bold text-[#FF7A00] hover:underline">
              Voir tout
            </Link>
          </div>
          {filteredDrivers.length === 0 ? (
            <p className="text-xs text-slate-500">
              {pendingDrivers.length === 0
                ? "Aucune demande en attente pour le moment."
                : `Aucun résultat pour « ${searchQuery} ».`}
            </p>
          ) : (
            <ul className="space-y-2.5">
              {filteredDrivers.map((driver) => (
                <li
                  key={driver.user_id}
                  className="flex flex-col gap-2 rounded-xl bg-slate-50/80 p-2.5 ring-1 ring-slate-100 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-bold text-[#FF7A00] ring-1 ring-orange-100">
                      {driver.name.charAt(0)}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{driver.name}</p>
                      <p className="text-[11px] text-slate-500">{driver.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <form action={reviewPendingDriverAction}>
                      <input type="hidden" name="user_id" value={driver.user_id} />
                      <input type="hidden" name="return_path" value="/admin" />
                      <input type="hidden" name="decision" value="approved" />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1 rounded-lg bg-[#FF7A00] px-2 py-1 text-[11px] font-bold text-white shadow-sm hover:bg-[#e66e00]"
                        aria-label={`Approuver ${driver.name}`}
                      >
                        <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                        Approuver
                      </button>
                    </form>
                    <form action={reviewPendingDriverAction}>
                      <input type="hidden" name="user_id" value={driver.user_id} />
                      <input type="hidden" name="return_path" value="/admin" />
                      <input type="hidden" name="decision" value="rejected" />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
                        aria-label={`Refuser ${driver.name}`}
                      >
                        <X className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                        Refuser
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Produits en stock faible</h2>
            <Link href="/admin/produits" className="text-xs font-bold text-[#FF7A00] hover:underline">
              Voir tout
            </Link>
          </div>
          {filteredLowStock.length === 0 ? (
            <p className="text-xs text-slate-500">
              {(snapshot.lowStock ?? []).length === 0
                ? "Aucun produit sous le seuil pour le moment."
                : "Aucun produit ne correspond à votre recherche."}
            </p>
          ) : (
            <ul className="space-y-2.5">
              {filteredLowStock.map((item) => (
                <li
                  key={item.productId}
                  className="flex items-center justify-between gap-2 rounded-xl bg-slate-50/80 p-2.5 ring-1 ring-slate-100"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">{item.name}</p>
                    <p className="text-[11px] text-slate-500">{item.boutique}</p>
                  </div>
                  <Link
                    href={`/admin/produits/${item.productId}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF7A00] hover:underline"
                  >
                    <Pencil className="h-3.5 w-3.5 shrink-0 opacity-90" strokeWidth={2} aria-hidden />
                    Stock : {item.stock}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/80 pt-4 text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Raaga. Tous droits réservés.</p>
        <p>Plateforme e-commerce & livraison locale au Burkina Faso</p>
      </div>
    </>
  );
}

function RevenueChart({ points, gradientId }: { points: AdminDashboardRevenuePoint[]; gradientId: string }) {
  const padL = 40;
  const padR = 14;
  const padT = 14;
  const padB = 30;
  const W = 620;
  const H = 220;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const n = points.length;
  const maxV = Math.max(1, ...points.map((p) => p.totalCfa));

  function xAt(i: number) {
    if (n <= 1) return padL + innerW / 2;
    return padL + (i / (n - 1)) * innerW;
  }
  function yAt(v: number) {
    return padT + (1 - v / maxV) * innerH;
  }

  const lineD =
    n === 0
      ? ""
      : points
          .map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(1)} ${yAt(p.totalCfa).toFixed(1)}`)
          .join(" ");

  const bottomY = (padT + innerH).toFixed(1);
  const areaD =
    n === 0
      ? ""
      : `${lineD} L ${xAt(n - 1).toFixed(1)} ${bottomY} L ${xAt(0).toFixed(1)} ${bottomY} Z`;

  return (
    <div className="rounded-xl bg-slate-50/60 p-2 ring-1 ring-slate-100">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-[140px] w-full sm:h-[180px]">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF7A00" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#FF7A00" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={padL} y1={padT + (i * innerH) / 4} x2={W - padR} y2={padT + (i * innerH) / 4} stroke="#f1f5f9" strokeWidth="1" />
        ))}
        {n > 0 && areaD ? <path d={areaD} fill={`url(#${gradientId})`} /> : null}
        {n > 0 && lineD ? (
          <path d={lineD} fill="none" stroke="#FF7A00" strokeWidth="3" strokeLinejoin="round" />
        ) : (
          <text x={W / 2} y={H / 2} textAnchor="middle" fontSize="12" fill="#94a3b8">
            Pas encore de données
          </text>
        )}
        {points.map((p, i) => (
          <text key={p.dateKey} x={xAt(i)} y={H - 6} fontSize={n > 14 ? 8 : 10} fill="#6b7280" textAnchor="middle">
            {p.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

function DonutChart({ slices, total }: { slices: AdminDashboardDonutSlice[]; total: number }) {
  const size = 132;
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  if (total <= 0 || slices.length === 0) {
    return (
      <div className="relative mx-auto w-fit sm:mx-0">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-black leading-none text-slate-400">0</p>
            <p className="text-xs text-slate-500">Total</p>
          </div>
        </div>
      </div>
    );
  }

  let offset = 0;
  const arcs = slices.map((segment) => {
    const dash = (segment.count / total) * circumference;
    const start = offset;
    offset += dash;
    return { segment, dash, start };
  });

  return (
    <div className="relative mx-auto w-fit sm:mx-0">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
        {arcs.map(({ segment, dash, start }) => (
          <circle
            key={segment.label}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={segment.color}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={-start}
            strokeLinecap="butt"
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-3xl font-black leading-none text-slate-900">{total}</p>
          <p className="text-xs text-slate-500">Total</p>
        </div>
      </div>
    </div>
  );
}
