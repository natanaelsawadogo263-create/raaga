"use client";

import Image from "next/image";
import { Loader2, Package, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { produitsHref, type CatalogUrlState } from "@/lib/catalog-query";
import type { CatalogSearchResponse } from "@/lib/catalog-search-types";

const DEBOUNCE_MS = 85;

function catalogStateForQuery(q: string): CatalogUrlState {
  return {
    q,
    page: 1,
    cat: "",
    min: null,
    max: null,
    sort: "recent",
    stock: "all",
  };
}

function catalogStateForCategory(cat: string): CatalogUrlState {
  return {
    q: "",
    page: 1,
    cat,
    min: null,
    max: null,
    sort: "recent",
    stock: "all",
  };
}

type SuggestionRow =
  | { kind: "product"; key: string; href: string; title: string; subtitle: string; imageUrl: string | null }
  | { kind: "category"; key: string; href: string; title: string; subtitle: string }
  | { kind: "more"; key: string; href: string; title: string; subtitle: string };

export function HeaderSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const urlQ = pathname === "/produits" ? (searchParams.get("q") ?? "").trim() : "";
  const [value, setValue] = useState(urlQ);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [data, setData] = useState<CatalogSearchResponse | null>(null);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    if (pathname === "/produits") {
      setValue((searchParams.get("q") ?? "").trim());
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    const q = value.trim();
    if (!q) {
      setData(null);
      setLoading(false);
      setError(false);
      setActive(-1);
      return;
    }

    let cancelled = false;
    const ac = new AbortController();
    setLoading(true);
    setError(false);

    const t = window.setTimeout(() => {
      const querySent = value.trim();
      if (!querySent) {
        if (!cancelled) {
          setLoading(false);
        }
        return;
      }

      fetch(`/api/catalog-search?${new URLSearchParams({ q: querySent })}`, {
        signal: ac.signal,
        credentials: "same-origin",
      })
        .then(async (r) => {
          if (!r.ok) {
            throw new Error("search");
          }
          return r.json() as Promise<CatalogSearchResponse>;
        })
        .then((json) => {
          if (cancelled) {
            return;
          }
          if (value.trim() !== json.query) {
            return;
          }
          setData(json);
          setActive(-1);
        })
        .catch((e: unknown) => {
          if (cancelled || (e instanceof DOMException && e.name === "AbortError")) {
            return;
          }
          setError(true);
          setData(null);
        })
        .finally(() => {
          if (!cancelled) {
            setLoading(false);
          }
        });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(t);
      ac.abort();
    };
  }, [value]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setActive(-1);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const rows: SuggestionRow[] = useMemo(() => {
    if (!data || !data.query) {
      return [];
    }
    const out: SuggestionRow[] = [];
    for (const p of data.products) {
      out.push({
        kind: "product",
        key: `p-${p.id}`,
        href: `/produits/${p.id}`,
        title: p.name,
        subtitle: `${p.price.toLocaleString("fr-FR")} FCFA · ${p.category} · ${p.city}`,
        imageUrl: p.imageUrl,
      });
    }
    for (const c of data.categories) {
      out.push({
        kind: "category",
        key: `c-${c}`,
        href: produitsHref(catalogStateForCategory(c)),
        title: c,
        subtitle: "Catégorie",
      });
    }
    if (data.total > data.products.length) {
      out.push({
        kind: "more",
        key: "more",
        href: produitsHref(catalogStateForQuery(data.query)),
        title: `Voir tous les résultats (${data.total})`,
        subtitle: "Catalogue",
      });
    }
    return out;
  }, [data]);

  const showPanel = open && value.trim().length > 0;

  const goRow = useCallback(
    (index: number) => {
      if (index < 0 || index >= rows.length) {
        return;
      }
      const row = rows[index];
      if (!row) {
        return;
      }
      setOpen(false);
      setActive(-1);
      router.push(row.href);
    },
    [rows, router],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showPanel) {
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setActive(-1);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (rows.length ? (i + 1) % rows.length : -1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => {
        if (!rows.length) {
          return -1;
        }
        if (i <= 0) {
          return rows.length - 1;
        }
        return i - 1;
      });
      return;
    }
    if (e.key === "Enter" && active >= 0 && rows[active]) {
      e.preventDefault();
      goRow(active);
    }
  };

  return (
    <div ref={rootRef} className="relative w-full min-w-0">
      <form
        action="/produits"
        method="get"
        role="search"
        className="w-full min-w-0"
        onSubmit={() => {
          setOpen(false);
          setActive(-1);
        }}
      >
        <label htmlFor="nav-search" className="sr-only">
          Rechercher un produit
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground md:left-3 md:h-4 md:w-4"
            strokeWidth={2}
            aria-hidden
          />
          <input
            ref={inputRef}
            id="nav-search"
            name="q"
            type="search"
            placeholder="Rechercher un article ou une categorie…"
            autoComplete="off"
            enterKeyHint="search"
            value={value}
            maxLength={120}
            onChange={(e) => {
              setValue(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            aria-expanded={showPanel}
            aria-controls={showPanel ? listId : undefined}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${listId}-opt-${active}` : undefined}
            className="h-8 w-full min-w-0 rounded-xl border border-border bg-background px-3 py-1 pl-9 text-sm text-foreground shadow-sm outline-none placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/20 md:h-9 md:py-1.5 md:pl-10"
          />
          {loading ? (
            <span className="pointer-events-none absolute right-2.5 top-1/2 flex -translate-y-1/2 md:right-3" aria-hidden>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground md:h-4 md:w-4" strokeWidth={2} />
            </span>
          ) : null}
        </div>
      </form>

      {showPanel ? (
        <div
          id={listId}
          role="listbox"
          aria-label="Suggestions de recherche"
          aria-busy={loading}
          className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-[280] max-h-[min(70vh,22rem)] overflow-y-auto rounded-2xl border border-border/90 bg-card py-2 shadow-[0_16px_40px_-12px_rgba(15,23,42,0.18)] ring-1 ring-black/[0.04] backdrop-blur-md"
        >
          {error ? (
            <p className="px-4 py-3 text-sm text-destructive">Impossible de charger les suggestions. Réessayez.</p>
          ) : null}
          {!error && !loading && value.trim() && data && data.total === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">Aucun résultat pour « {value.trim()} ».</p>
          ) : null}
          {!error && rows.length
            ? rows.map((row, index) => {
                const highlighted = index === active;
                const common =
                  "flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition md:px-3.5 md:py-3 " +
                  (highlighted ? "bg-brand/10 text-foreground" : "text-foreground hover:bg-muted/70");
                const optId = `${listId}-opt-${index}`;
                if (row.kind === "product") {
                  return (
                    <Link
                      key={row.key}
                      id={optId}
                      role="option"
                      aria-selected={highlighted}
                      href={row.href}
                      className={common}
                      onMouseEnter={() => setActive(index)}
                      onClick={() => {
                        setOpen(false);
                        setActive(-1);
                      }}
                    >
                      <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-muted/80 ring-1 ring-border/60">
                        {row.imageUrl?.startsWith("http") ? (
                          <Image src={row.imageUrl} alt="" fill sizes="44px" className="object-cover" />
                        ) : row.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element -- chemins publics ou data hétérogènes
                          <img src={row.imageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <Package className="h-5 w-5" strokeWidth={1.5} aria-hidden />
                          </span>
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-bold leading-snug">{row.title}</span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">{row.subtitle}</span>
                      </span>
                    </Link>
                  );
                }
                return (
                  <Link
                    key={row.key}
                    id={optId}
                    role="option"
                    aria-selected={highlighted}
                    href={row.href}
                    className={common}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => {
                      setOpen(false);
                      setActive(-1);
                    }}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-bold leading-snug">{row.title}</span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">{row.subtitle}</span>
                    </span>
                  </Link>
                );
              })
            : null}
          {!error && loading && value.trim() && !rows.length ? (
            <div className="space-y-2 px-3 py-3 md:px-3.5" aria-hidden>
              <div className="h-12 animate-pulse rounded-xl bg-muted/75" />
              <div className="h-12 animate-pulse rounded-xl bg-muted/60" />
              <div className="h-12 w-[80%] animate-pulse rounded-xl bg-muted/50" />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
