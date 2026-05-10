import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Heart, ListChecks, Truck } from "lucide-react";
import { addToFavoritesAction } from "@/app/actions";
import { CatalogBreadcrumbs } from "@/components/catalog/catalog-breadcrumbs";
import { CatalogProductCard } from "@/components/catalog-product-card";
import { CatalogTrustStrip } from "@/components/catalog/catalog-trust-strip";
import { ProductGallery } from "@/components/product-gallery";
import { ProductPromoPrices } from "@/components/product-promo-prices";
import { ProductQuantityAdd } from "@/components/product-quantity-add";
import { PageShell } from "@/components/raaga/page-shell";
import { produitsHref } from "@/lib/catalog-query";
import { fetchCatalogProducts, fetchProductById, relatedCatalogProducts } from "@/lib/catalog-products";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = await fetchProductById(id);
  if (!p) {
    return { title: "Produit | Raaga" };
  }
  const desc = p.description.trim() || `${p.name} — ${p.category} sur Raaga.`;
  return {
    title: `${p.name} | Raaga`,
    description: desc.length > 160 ? `${desc.slice(0, 157)}…` : desc,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = await fetchProductById(id);
  if (!product) {
    notFound();
  }

  const catalog = await fetchCatalogProducts();
  const related = relatedCatalogProducts(catalog, product.category, product.id, 4);
  const disabled = product.stockQuantity <= 0;

  const categoryHref = produitsHref({ q: "", page: 1, cat: product.category, min: null, max: null, sort: "recent", stock: "all" });

  return (
    <PageShell>
      <div className="mx-auto w-[min(1320px,calc(100%-2rem))] py-4 sm:py-6">
        <CatalogBreadcrumbs items={[{ label: "Produits", href: "/produits" }, { label: product.name }]} />

        <div className="mx-auto mt-4 grid max-w-4xl gap-6 lg:mt-6 lg:auto-rows-max lg:grid-cols-[minmax(0,270px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:items-start lg:gap-6 xl:gap-8">
          <div className="mx-auto w-full max-w-[min(292px,100%)] justify-self-center sm:max-w-[300px] lg:mx-0 lg:max-w-none lg:justify-self-start">
            <ProductGallery compact images={product.images} productName={product.name} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Link
                href={categoryHref}
                className="rounded-full bg-brand/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand transition hover:bg-brand/15 sm:text-[11px]"
              >
                {product.category}
              </Link>
              <span className="text-xs text-muted-foreground sm:text-sm">
                <Truck className="mr-0.5 inline h-3.5 w-3.5 align-text-bottom text-brand sm:h-4 sm:w-4" aria-hidden />
                Expédition depuis <strong className="text-foreground">{product.city}</strong>
              </span>
            </div>

            <h1 className="mt-2 text-2xl font-black leading-tight tracking-tight text-foreground sm:text-3xl lg:text-[1.85rem] lg:leading-snug">
              {product.name}
            </h1>

            <ProductPromoPrices product={product} variant="detail" />

            {disabled || product.stockQuantity <= 5 ? (
              <p
                className={`mt-1.5 text-xs font-semibold sm:text-sm ${disabled ? "text-red-600" : "text-amber-700"}`}
              >
                {disabled
                  ? "Rupture de stock pour le moment."
                  : `Stock limité : ${product.stockQuantity} disponible(s).`}
              </p>
            ) : null}

            <div className="mt-4 rounded-xl border border-border/75 bg-card/90 p-4 shadow-sm ring-1 ring-black/[0.03]">
              <h2 className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Description</h2>
              <div className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {product.description.trim() ? (
                  <p className="whitespace-pre-line">{product.description}</p>
                ) : (
                  <p>Découvrez ce produit dans notre catalogue. Pour toute question, contactez le support Raaga.</p>
                )}
              </div>
            </div>

            {product.variantOptions.length > 0 ? (
              <div className="mt-4 rounded-xl border border-border/75 bg-card/90 p-4 shadow-sm ring-1 ring-black/[0.03]">
                <div className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-brand" aria-hidden />
                  <h2 className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    Caractéristiques
                  </h2>
                </div>
                <dl className="mt-2 grid gap-2 sm:grid-cols-2">
                  {product.variantOptions.map((opt) => (
                    <div key={opt.name} className="rounded-lg bg-muted/30 px-3 py-2">
                      <dt className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                        {opt.name}
                      </dt>
                      <dd className="mt-1 flex flex-wrap gap-1.5">
                        {opt.values.map((value) => (
                          <span
                            key={`${opt.name}-${value}`}
                            className="inline-flex items-center rounded-full bg-card px-2 py-0.5 text-xs font-semibold text-foreground ring-1 ring-border/70"
                          >
                            {value}
                          </span>
                        ))}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Choisissez vos préférences ci-dessous avant d&apos;ajouter au panier.
                </p>
              </div>
            ) : null}

            <div className="mt-4 rounded-xl border border-border/70 bg-gradient-to-br from-orange-50/50 to-card p-4 ring-1 ring-orange-100/60">
              <ProductQuantityAdd
                productId={product.id}
                maxQty={product.stockQuantity}
                disabled={disabled}
                variantOptions={product.variantOptions}
              />
              <form action={addToFavoritesAction} className="mt-3">
                <input type="hidden" name="product_id" value={product.id} />
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border/90 bg-card py-2.5 text-xs font-bold text-foreground shadow-sm transition hover:border-rose-300/60 hover:bg-rose-50/50 sm:w-auto sm:px-5 sm:text-sm"
                >
                  <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
                  Ajouter aux favoris
                </button>
              </form>
            </div>
          </div>
        </div>

        {related.length > 0 ? (
          <section className="mt-10 border-t border-border/80 pt-8 sm:mt-12 sm:pt-10">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">À découvrir aussi</p>
                <h2 className="mt-1 text-xl font-black tracking-tight text-foreground sm:text-2xl">Même univers : {product.category}</h2>
              </div>
              <Link href={categoryHref} className="text-sm font-bold text-brand underline-offset-4 hover:underline">
                Voir toute la catégorie
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {related.map((p) => (
                <CatalogProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        ) : null}

        <div className="mt-10 sm:mt-12">
          <CatalogTrustStrip />
        </div>
      </div>
    </PageShell>
  );
}
