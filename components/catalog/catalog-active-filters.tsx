import Link from "next/link";
import { X } from "lucide-react";
import type { CatalogUrlState } from "@/lib/catalog-query";
import { produitsHref } from "@/lib/catalog-query";

type CatalogActiveFiltersProps = {
  state: CatalogUrlState;
};

export function CatalogActiveFilters({ state }: CatalogActiveFiltersProps) {
  const chips: { label: string; href: string }[] = [];

  if (state.q.trim()) {
    chips.push({
      label: `« ${state.q.trim()} »`,
      href: produitsHref({ ...state, q: "", page: 1 }),
    });
  }
  if (state.cat) {
    chips.push({
      label: state.cat,
      href: produitsHref({ ...state, cat: "", page: 1 }),
    });
  }
  if (state.min != null) {
    chips.push({
      label: `Min ${state.min.toLocaleString("fr-FR")} FCFA`,
      href: produitsHref({ ...state, min: null, page: 1 }),
    });
  }
  if (state.max != null) {
    chips.push({
      label: `Max ${state.max.toLocaleString("fr-FR")} FCFA`,
      href: produitsHref({ ...state, max: null, page: 1 }),
    });
  }
  if (state.stock === "in_stock") {
    chips.push({
      label: "En stock",
      href: produitsHref({ ...state, stock: "all", page: 1 }),
    });
  }

  if (!chips.length) {
    return null;
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-muted-foreground">Filtres actifs :</span>
      {chips.map((c) => (
        <Link
          key={c.label}
          href={c.href}
          className="inline-flex items-center gap-1 rounded-full border border-brand/25 bg-orange-50/90 py-1 pl-3 pr-1.5 text-xs font-bold text-orange-950 shadow-sm transition hover:bg-orange-100"
        >
          {c.label}
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-orange-700 ring-1 ring-orange-200/80">
            <X className="h-3.5 w-3.5" aria-hidden />
          </span>
        </Link>
      ))}
      <Link href={produitsHref({ ...state, q: "", cat: "", min: null, max: null, stock: "all", page: 1 })} className="text-xs font-semibold text-brand underline-offset-4 hover:underline">
        Tout effacer
      </Link>
    </div>
  );
}
