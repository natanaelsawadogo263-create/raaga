import {
  CATALOG_PAGE_SIZE,
  filterAndSortCatalog,
  parseCatalogParams,
  produitsHref,
  type CatalogUrlState,
} from "@/lib/catalog-query";
import { fetchCatalogProducts } from "@/lib/catalog-products";
import { CatalogPagination } from "@/components/catalog/catalog-pagination";
import { CatalogResultsSummary } from "@/components/catalog/catalog-results-summary";
import { CatalogProductCard } from "@/components/catalog-product-card";
import { PageShell, RaCard } from "@/components/raaga/page-shell";
import Link from "next/link";

type ProduitsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProduitsPage({ searchParams }: ProduitsPageProps) {
  const sp = await searchParams;
  const raw = parseCatalogParams(sp);
  /** Prix et stock : filtres désactivés côté catalogue public ; catégorie et recherche `q` restent actifs. */
  const state: CatalogUrlState = {
    ...raw,
    min: null,
    max: null,
    stock: "all",
  };

  const allProducts = await fetchCatalogProducts();
  const filtered = filterAndSortCatalog(allProducts, state);
  const totalPages = Math.max(1, Math.ceil(filtered.length / CATALOG_PAGE_SIZE));
  const page = Math.min(state.page, totalPages);
  const viewState = { ...state, page };
  const products = filtered.slice((page - 1) * CATALOG_PAGE_SIZE, page * CATALOG_PAGE_SIZE);

  const clearSearchHref = produitsHref({
    ...viewState,
    q: "",
    page: 1,
  });

  return (
    <PageShell>
      <div className="mx-auto w-[min(1320px,calc(100%-2rem))] py-6 sm:py-10">
        <div className="min-w-0">
          {products.length ? (
            <>
              <CatalogResultsSummary totalFiltered={filtered.length} page={page} />
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
                {products.map((product) => (
                  <CatalogProductCard key={product.id} product={product} />
                ))}
              </div>
              <CatalogPagination state={viewState} totalPages={totalPages} />
            </>
          ) : (
            <RaCard
              padding="p-10 sm:p-14"
              className="text-center shadow-[0_20px_48px_-24px_rgba(249,115,22,0.2)] ring-1 ring-orange-100/60"
            >
              <p className="text-xl font-black text-foreground">
                {viewState.q.trim()
                  ? "Aucun produit ne correspond à votre recherche"
                  : "Aucun produit pour le moment"}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {viewState.q.trim()
                  ? "Essayez un autre mot-clé ou parcourez tout le catalogue."
                  : "Revenez bientôt : le catalogue est en cours d’alimentation."}
              </p>
              {viewState.q.trim() ? (
                <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <Link
                    href={clearSearchHref}
                    className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-brand px-8 text-sm font-bold text-brand-contrast shadow-lg shadow-orange-500/25 transition hover:brightness-105"
                  >
                    Effacer la recherche
                  </Link>
                  <Link
                    href="/produits"
                    className="text-sm font-bold text-muted-foreground underline-offset-4 hover:text-brand hover:underline"
                  >
                    Tout le catalogue
                  </Link>
                </div>
              ) : null}
            </RaCard>
          )}
        </div>
      </div>
    </PageShell>
  );
}
