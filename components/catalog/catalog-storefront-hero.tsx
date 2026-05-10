import { Sparkles } from "lucide-react";
import { CatalogBreadcrumbs, type Crumb } from "@/components/catalog/catalog-breadcrumbs";

type CatalogStorefrontHeroProps = {
  title: string;
  description: string;
  totalSkus: number;
  crumbs?: Crumb[];
  /** Bandeau optionnel (ex. page promo) */
  variant?: "default" | "promo";
};

export function CatalogStorefrontHero({
  title,
  description,
  totalSkus: _totalSkus,
  crumbs = [{ label: "Produits" }],
  variant = "default",
}: CatalogStorefrontHeroProps) {
  const isPromo = variant === "promo";

  return (
    <div
      className={`relative overflow-hidden rounded-[1.75rem] border px-5 py-8 shadow-[0_20px_50px_-20px_rgba(249,115,22,0.35)] sm:px-10 sm:py-10 ${
        isPromo
          ? "border-orange-300/50 bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 text-white"
          : "border-orange-200/60 bg-gradient-to-br from-card via-card to-orange-50/90 ring-1 ring-orange-100/80"
      }`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute -right-16 top-0 h-48 w-48 rounded-full blur-3xl ${
          isPromo ? "bg-lime-300/25" : "bg-brand/20"
        }`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full blur-3xl ${
          isPromo ? "bg-white/10" : "bg-amber-400/15"
        }`}
      />

      <div className="relative">
        <CatalogBreadcrumbs items={crumbs} tone={isPromo ? "onBrand" : "default"} />

        <div className="mt-6">
          <div className="max-w-2xl">
            <p
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${
                isPromo ? "bg-white/15 text-orange-50" : "bg-brand/10 text-brand"
              }`}
            >
              <Sparkles className={`h-3.5 w-3.5 ${isPromo ? "text-lime-200" : ""}`} aria-hidden />
              {isPromo ? "Offres du moment" : "Boutique en ligne"}
            </p>
            <h1
              className={`mt-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-[2.5rem] lg:leading-[1.1] ${
                isPromo ? "text-white" : "text-foreground"
              }`}
            >
              {title}
            </h1>
            <p
              className={`mt-3 max-w-xl text-[15px] leading-relaxed sm:text-base ${
                isPromo ? "text-orange-50/95" : "text-muted-foreground"
              }`}
            >
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
