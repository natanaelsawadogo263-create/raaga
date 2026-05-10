import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CatalogProductCard } from "@/components/catalog-product-card";
import { PageShell, btnPrimaryClass, btnSecondaryClass } from "@/components/raaga/page-shell";
import { fetchCatalogProducts } from "@/lib/catalog-products";

export default async function PromoPage() {
  const all = await fetchCatalogProducts();
  const promoProducts = all.filter((p) => p.status === "promotion");

  return (
    <PageShell>
      <div className="mx-auto w-[min(1320px,calc(100%-2rem))] py-6 sm:py-10">
        {promoProducts.length > 0 ? (
          <section>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Offres en cours</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                  Produit en promotion
                </h2>
              </div>
              <Link
                href="/produits"
                className="inline-flex items-center gap-1 text-sm font-bold text-brand underline-offset-4 hover:underline"
              >
                Catalogue complet
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
              {promoProducts.map((p) => (
                <CatalogProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        ) : (
          <div className="rounded-3xl border border-dashed border-border/90 bg-muted/20 px-6 py-14 text-center">
            <p className="text-lg font-bold text-foreground">Aucune promotion active pour le moment</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Revenez bientôt ou parcourez le catalogue pour découvrir les nouveautés.
            </p>
            <Link href="/produits" className={`${btnPrimaryClass} mt-6 inline-flex gap-2`}>
              Voir tous les produits
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        )}

        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <Link href="/produits" className={btnPrimaryClass}>
            Toute la boutique
          </Link>
          <Link href="/" className={btnSecondaryClass}>
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
