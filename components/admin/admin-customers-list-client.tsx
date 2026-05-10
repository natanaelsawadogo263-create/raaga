"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { AdminCustomerRowActions } from "@/components/admin/admin-customer-row-actions";
import type { AdminCustomerRow } from "@/lib/admin/data";
import { formatOrderDate } from "@/lib/admin/format";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function displayName(c: AdminCustomerRow) {
  return `${c.first_name} ${c.last_name}`.trim();
}

export function AdminCustomersListClient({
  initialCustomers,
  totalCount,
}: {
  initialCustomers: AdminCustomerRow[];
  totalCount: number;
}) {
  const [inputValue, setInputValue] = useState("");
  const [debounced, setDebounced] = useState("");
  const [results, setResults] = useState<AdminCustomerRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchErr, setFetchErr] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(inputValue.trim()), 350);
    return () => window.clearTimeout(t);
  }, [inputValue]);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (debounced.length === 0) {
      abortRef.current?.abort();
      setResults(null);
      setFetchErr(null);
      setLoading(false);
      return;
    }

    if (debounced.length < 2 && !UUID_RE.test(debounced)) {
      abortRef.current?.abort();
      setResults(null);
      setFetchErr(null);
      setLoading(false);
      return;
    }

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setLoading(true);
    setFetchErr(null);

    const url = `/api/admin/clients/search?q=${encodeURIComponent(debounced)}`;
    fetch(url, { signal: ac.signal, credentials: "same-origin" })
      .then(async (r) => {
        const j = (await r.json()) as { customers?: AdminCustomerRow[]; error?: string };
        if (!r.ok) {
          throw new Error(j.error ?? `Erreur ${r.status}`);
        }
        setResults(j.customers ?? []);
      })
      .catch((e: Error) => {
        if (e.name === "AbortError") {
          return;
        }
        setFetchErr(e.message ?? "Erreur réseau");
        setResults([]);
      })
      .finally(() => {
        if (!ac.signal.aborted) {
          setLoading(false);
        }
      });

    return () => ac.abort();
  }, [debounced]);

  const tooShort =
    debounced.length > 0 && debounced.length < 2 && !UUID_RE.test(debounced);

  const displayed: AdminCustomerRow[] = tooShort
    ? []
    : results === null
      ? initialCustomers
      : results;

  const countLabel =
    debounced.length === 0
      ? totalCount
      : tooShort
        ? 0
        : displayed.length;

  return (
    <div>
      <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0 shrink-0">
          <h2 className="text-sm font-bold text-slate-900">
            {debounced.length === 0 ? "Comptes clients" : "Résultats de recherche"}{" "}
            <span className="font-black text-[#FF7A00]">({countLabel})</span>
          </h2>
          {debounced.length > 0 ? (
            <p className="mt-0.5 text-[11px] text-slate-500">Recherche asynchrone sur la base</p>
          ) : null}
        </div>
        <div className="relative min-w-0 flex-1 sm:max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            strokeWidth={2}
            aria-hidden
          />
          <input
            type="search"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Nom, téléphone, ville, e-mail, UUID…"
            autoComplete="off"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-9 pr-10 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#FF7A00] focus:bg-white focus:ring-2 focus:ring-[#FF7A00]/20"
            aria-label="Rechercher un client"
          />
          {loading ? (
            <Loader2
              className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#FF7A00]"
              aria-hidden
            />
          ) : null}
        </div>
      </div>

      {fetchErr ? (
        <p className="border-b border-rose-100 bg-rose-50/80 px-4 py-2 text-xs font-semibold text-rose-800">{fetchErr}</p>
      ) : null}

      {tooShort ? (
        <p className="px-4 py-4 text-center text-sm text-slate-500">Saisissez au moins 2 caractères (ou un UUID complet).</p>
      ) : displayed.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-slate-500">
          {debounced.length === 0 ? "Aucun client." : `Aucun résultat pour « ${debounced} ».`}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead className="text-slate-500">
              <tr className="border-b border-slate-200">
                <th className="py-2.5 pl-4 font-bold">Client</th>
                <th className="font-bold">E-mail</th>
                <th className="font-bold">Téléphone</th>
                <th className="font-bold">Ville</th>
                <th className="font-bold">Actif</th>
                <th className="font-bold">Inscrit</th>
                <th className="pr-4 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((c) => (
                <tr key={c.id} className="border-b border-slate-100">
                  <td className="py-2.5 pl-4 font-semibold text-slate-900">{displayName(c)}</td>
                  <td className="max-w-[200px] truncate text-slate-700">{c.email ?? "—"}</td>
                  <td className="text-slate-700">{c.phone}</td>
                  <td className="text-slate-700">{c.city}</td>
                  <td>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        c.is_active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {c.is_active ? "Oui" : "Non"}
                    </span>
                  </td>
                  <td className="text-slate-600">{formatOrderDate(c.created_at)}</td>
                  <td className="pr-4 text-right">
                    <AdminCustomerRowActions customerId={c.id} displayName={displayName(c)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
