import Link from "next/link";
import { ArrowDownAZ, Clock, Euro, TrendingDown, TrendingUp } from "lucide-react";
import type { CatalogSort, CatalogUrlState } from "@/lib/catalog-query";
import { produitsHref } from "@/lib/catalog-query";

const options: { sort: CatalogSort; label: string; icon: typeof Clock }[] = [
  { sort: "recent", label: "Nouveautés", icon: Clock },
  { sort: "price_asc", label: "Prix ↑", icon: TrendingUp },
  { sort: "price_desc", label: "Prix ↓", icon: TrendingDown },
  { sort: "name", label: "A → Z", icon: ArrowDownAZ },
];

type CatalogSortBarProps = {
  state: CatalogUrlState;
};

export function CatalogSortBar({ state }: CatalogSortBarProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Trier par</p>
      <div className="flex flex-wrap gap-2">
        {options.map(({ sort, label, icon: Icon }) => {
          const active = state.sort === sort;
          const href = produitsHref({ ...state, sort, page: 1 });
          return (
            <Link
              key={sort}
              href={href}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold transition ${
                active
                  ? "border-brand bg-brand text-brand-contrast shadow-md shadow-orange-500/25"
                  : "border-border/90 bg-card text-foreground hover:border-brand/35 hover:bg-orange-50/70"
              }`}
            >
              <Icon className="h-3.5 w-3.5 opacity-90" strokeWidth={2} aria-hidden />
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
