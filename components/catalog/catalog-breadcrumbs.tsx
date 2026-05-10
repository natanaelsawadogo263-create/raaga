import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export type Crumb = { label: string; href?: string };

export function CatalogBreadcrumbs({ items, tone = "default" }: { items: Crumb[]; tone?: "default" | "onBrand" }) {
  const onBrand = tone === "onBrand";

  return (
    <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-1.5 text-sm">
      <Link
        href="/"
        className={`inline-flex items-center gap-1 rounded-lg px-1.5 py-0.5 font-medium transition ${
          onBrand
            ? "text-white/85 hover:bg-white/10 hover:text-white"
            : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
        }`}
      >
        <Home className="h-3.5 w-3.5 opacity-80" aria-hidden />
        Accueil
      </Link>
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex items-center gap-1.5">
          <ChevronRight className={`h-3.5 w-3.5 shrink-0 ${onBrand ? "text-white/55" : "text-muted-foreground/70"}`} aria-hidden />
          {item.href ? (
            <Link
              href={item.href}
              className={`rounded-lg px-1.5 py-0.5 font-medium transition ${
                onBrand ? "text-white/85 hover:bg-white/10 hover:text-white" : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ) : (
            <span
              className={`max-w-[min(52vw,16rem)] truncate font-semibold ${onBrand ? "text-white" : "text-foreground"}`}
            >
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
