import Link from "next/link";
import { Filter, RotateCcw } from "lucide-react";
import type { CatalogSort, CatalogUrlState } from "@/lib/catalog-query";
import { inputClass, selectClass } from "@/components/raaga/page-shell";

const sortLabels: Record<CatalogSort, string> = {
  recent: "Plus récents",
  price_asc: "Prix croissant",
  price_desc: "Prix décroissant",
  name: "Nom A-Z",
};

const sortOrder: CatalogSort[] = ["recent", "price_asc", "price_desc", "name"];

type CatalogFiltersFormProps = {
  state: CatalogUrlState;
  categories: string[];
  globalPrice: { min: number; max: number };
  className?: string;
  id?: string;
};

export function CatalogFiltersForm({
  state,
  categories,
  globalPrice,
  className = "",
  id = "catalog-filters",
}: CatalogFiltersFormProps) {
  const hasActiveFilters =
    state.cat !== "" ||
    state.min != null ||
    state.max != null ||
    state.sort !== "recent" ||
    state.stock === "in_stock";

  const formKey = [state.q, state.cat, state.min, state.max, state.sort, state.stock].join("|");

  return (
    <div className={className}>
      <div className="mb-5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 text-sm font-black text-foreground">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand/15 to-amber-500/10 text-brand shadow-sm ring-1 ring-brand/10">
            <Filter className="h-4 w-4" aria-hidden />
          </span>
          Filtres
        </div>
        {hasActiveFilters ? (
          <Link
            href={state.q ? `/produits?q=${encodeURIComponent(state.q)}` : "/produits"}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-muted-foreground transition hover:bg-muted/80 hover:text-brand"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            Réinitialiser
          </Link>
        ) : null}
      </div>

      <form key={formKey} id={id} method="get" action="/produits" className="space-y-6">
        {state.q ? <input type="hidden" name="q" value={state.q} /> : null}

        <div>
          <label htmlFor={`${id}-cat`} className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Catégorie
          </label>
          <select id={`${id}-cat`} name="cat" defaultValue={state.cat} className={selectClass}>
            <option value="">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <fieldset className="space-y-3 rounded-2xl border border-border/60 bg-muted/15 p-4">
          <legend className="px-1 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Fourchette de prix (FCFA)
          </legend>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={`${id}-min`} className="sr-only">
                Prix minimum
              </label>
              <input
                id={`${id}-min`}
                name="min"
                type="number"
                min={0}
                step={100}
                placeholder={`Min (${globalPrice.min.toLocaleString("fr-FR")})`}
                defaultValue={state.min ?? ""}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor={`${id}-max`} className="sr-only">
                Prix maximum
              </label>
              <input
                id={`${id}-max`}
                name="max"
                type="number"
                min={0}
                step={100}
                placeholder={`Max (${globalPrice.max.toLocaleString("fr-FR")})`}
                defaultValue={state.max ?? ""}
                className={inputClass}
              />
            </div>
          </div>
        </fieldset>

        <div>
          <label htmlFor={`${id}-stock`} className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Disponibilité
          </label>
          <select id={`${id}-stock`} name="stock" defaultValue={state.stock === "in_stock" ? "in_stock" : ""} className={selectClass}>
            <option value="">Tous les produits</option>
            <option value="in_stock">En stock uniquement</option>
          </select>
        </div>

        <div>
          <label htmlFor={`${id}-sort`} className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Trier par
          </label>
          <select
            id={`${id}-sort`}
            name="sort"
            defaultValue={state.sort === "recent" ? "" : state.sort}
            className={selectClass}
          >
            {sortOrder.map((k) => (
              <option key={k} value={k === "recent" ? "" : k}>
                {sortLabels[k]}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full rounded-2xl bg-gradient-to-r from-brand to-orange-600 py-3.5 text-sm font-black text-brand-contrast shadow-lg shadow-orange-500/25 transition hover:brightness-105 active:scale-[0.99]"
        >
          Appliquer les filtres
        </button>
      </form>
    </div>
  );
}
