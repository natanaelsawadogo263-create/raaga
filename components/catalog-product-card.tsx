import Image from "next/image";
import Link from "next/link";
import { Eye, Heart, Package } from "lucide-react";
import { addToFavoritesAction } from "@/app/actions";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { HeavyProductBadge } from "@/components/heavy-product-badge";
import type { CatalogProduct } from "@/lib/catalog-products";
import { ProductPromoPrices } from "@/components/product-promo-prices";

export type { CatalogProduct } from "@/lib/catalog-products";

export function CatalogProductCard({ product }: { product: CatalogProduct }) {
  const disabled = product.stockQuantity <= 0;
  const href = `/produits/${product.id}`;

  return (
    <article className="group/card relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/65 bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_16px_40px_-20px_rgba(15,23,42,0.12)] ring-1 ring-black/[0.03] transition duration-300 hover:-translate-y-1.5 hover:border-brand/35 hover:shadow-[0_20px_48px_-16px_rgba(249,115,22,0.28)] active:scale-[0.98]">
      <Link href={href} className="relative block aspect-square w-full overflow-hidden bg-gradient-to-br from-orange-50/80 via-muted/90 to-amber-50/50">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition duration-500 group-hover/card:scale-[1.06]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package
              className="h-14 w-14 text-orange-200/95 transition duration-300 group-hover/card:scale-110 group-hover/card:text-orange-300"
              strokeWidth={1.15}
              aria-hidden
            />
          </div>
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-60 transition group-hover/card:opacity-80"
        />
        <span className="absolute left-3 top-3 z-10 max-w-[calc(100%-1.5rem)] truncate rounded-lg bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-orange-950 shadow-md ring-1 ring-black/[0.06] backdrop-blur-sm">
          {product.category}
        </span>
        {product.isHeavy ? <HeavyProductBadge /> : null}
      </Link>

      <div className="relative z-10 flex flex-1 flex-col p-3">
        <div className="mb-1.5 flex items-start justify-between gap-2">
          <Link href={href} className="min-w-0 flex-1 rounded-lg outline-none ring-brand/0 transition hover:text-brand focus-visible:ring-2 focus-visible:ring-brand/40">
            <h3 className="line-clamp-2 min-h-[2.25rem] text-[14px] font-bold leading-snug tracking-tight text-foreground">{product.name}</h3>
          </Link>
        </div>

        <div className="mt-auto">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <ProductPromoPrices product={product} variant="card" />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-1.5">
            <Link
              href={href}
              className="inline-flex h-9 items-center justify-center gap-1 rounded-xl border border-border/90 bg-background text-xs font-bold text-foreground shadow-sm transition hover:border-brand/35 hover:bg-orange-50/70"
            >
              <Eye className="h-3.5 w-3.5" aria-hidden />
              Voir
            </Link>
            <form action={addToFavoritesAction} className="contents">
              <input type="hidden" name="product_id" value={product.id} />
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center gap-1 rounded-xl border border-border/90 bg-background text-xs font-bold text-foreground shadow-sm transition hover:border-rose-300/60 hover:bg-rose-50/80"
              >
                <Heart className="h-3.5 w-3.5" aria-hidden />
                Favori
              </button>
            </form>
          </div>

          <AddToCartButton
            productId={product.id}
            disabled={disabled}
            className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-bold text-brand-contrast shadow-lg shadow-orange-500/25 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-55"
          />
        </div>
      </div>
    </article>
  );
}
