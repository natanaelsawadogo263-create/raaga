import { SlidersHorizontal } from "lucide-react";
import type { CatalogUrlState } from "@/lib/catalog-query";
import { CatalogFiltersForm } from "@/components/catalog/catalog-filters-form";

type CatalogMobileFiltersProps = {
  state: CatalogUrlState;
  categories: string[];
  globalPrice: { min: number; max: number };
};

export function CatalogMobileFilters({ state, categories, globalPrice }: CatalogMobileFiltersProps) {
  return (
    <details className="group mb-8 overflow-hidden rounded-2xl border border-border/75 bg-card shadow-[0_12px_32px_-16px_rgba(15,23,42,0.12)] ring-1 ring-black/[0.04] lg:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 text-sm font-black text-foreground [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <SlidersHorizontal className="h-4 w-4" strokeWidth={2} aria-hidden />
          </span>
          Filtres & tri
        </span>
        <span className="rounded-full bg-muted/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground group-open:bg-brand/15 group-open:text-brand">
          Affiner
        </span>
      </summary>
      <div className="border-t border-border/70 bg-gradient-to-b from-muted/25 to-card px-4 py-5">
        <CatalogFiltersForm state={state} categories={categories} globalPrice={globalPrice} id="catalog-filters-mobile" />
      </div>
    </details>
  );
}
