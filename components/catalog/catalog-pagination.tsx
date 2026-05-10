import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CatalogUrlState } from "@/lib/catalog-query";
import { getPaginationRange, produitsHref } from "@/lib/catalog-query";

type CatalogPaginationProps = {
  state: CatalogUrlState;
  totalPages: number;
};

export function CatalogPagination({ state, totalPages }: CatalogPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const current = state.page;
  const range = getPaginationRange(current, totalPages);

  const prev = current > 1 ? produitsHref({ ...state, page: current - 1 }) : null;
  const next = current < totalPages ? produitsHref({ ...state, page: current + 1 }) : null;

  return (
    <nav
      className="mt-14 flex flex-col items-center gap-5 border-t border-border/75 pt-10 sm:flex-row sm:justify-between"
      aria-label="Pagination du catalogue"
    >
      <p className="order-2 text-sm text-muted-foreground sm:order-1">
        Page <span className="font-black text-foreground">{current}</span> sur{" "}
        <span className="font-black text-foreground">{totalPages}</span>
      </p>

      <div className="order-1 flex items-center gap-1.5 sm:order-2">
        {prev ? (
          <Link
            href={prev}
            className="inline-flex h-11 min-w-11 items-center justify-center rounded-full border border-border/80 bg-card text-foreground shadow-sm transition hover:border-brand/35 hover:bg-orange-50/60"
            aria-label="Page précédente"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </Link>
        ) : (
          <span
            className="inline-flex h-11 min-w-11 items-center justify-center rounded-full border border-transparent bg-muted/50 text-muted-foreground opacity-45"
            aria-hidden
          >
            <ChevronLeft className="h-5 w-5" />
          </span>
        )}

        <ul className="flex items-center gap-1 px-1">
          {range.map((item, i) =>
            item === "ellipsis" ? (
              <li key={`e-${i}`} className="px-2 text-muted-foreground">
                …
              </li>
            ) : (
              <li key={item}>
                {item === current ? (
                  <span
                    className="inline-flex h-11 min-w-11 items-center justify-center rounded-full bg-brand px-3 text-sm font-black text-brand-contrast shadow-md shadow-orange-500/25"
                    aria-current="page"
                  >
                    {item}
                  </span>
                ) : (
                  <Link
                    href={produitsHref({ ...state, page: item })}
                    className="inline-flex h-11 min-w-11 items-center justify-center rounded-full border border-transparent px-3 text-sm font-bold text-foreground transition hover:border-border hover:bg-card"
                  >
                    {item}
                  </Link>
                )}
              </li>
            ),
          )}
        </ul>

        {next ? (
          <Link
            href={next}
            className="inline-flex h-11 min-w-11 items-center justify-center rounded-full border border-border/80 bg-card text-foreground shadow-sm transition hover:border-brand/35 hover:bg-orange-50/60"
            aria-label="Page suivante"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </Link>
        ) : (
          <span
            className="inline-flex h-11 min-w-11 items-center justify-center rounded-full border border-transparent bg-muted/50 text-muted-foreground opacity-45"
            aria-hidden
          >
            <ChevronRight className="h-5 w-5" />
          </span>
        )}
      </div>
    </nav>
  );
}
