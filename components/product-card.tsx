import Link from "next/link";
import { Heart, Package, ShoppingCart, Star } from "lucide-react";
import type { Product } from "@/lib/raaga-data";
import { StatusBadge } from "@/components/status-badge";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm ring-1 ring-black/[0.03] transition hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-lg hover:shadow-orange-500/10">
      <div className="relative mb-3 flex h-36 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-orange-50 via-muted to-amber-50/80">
        <Package className="h-14 w-14 text-orange-200/90 transition group-hover:scale-105 group-hover:text-orange-300/90" strokeWidth={1.25} aria-hidden />
      </div>
      <div className="px-4 pb-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-bold leading-snug">{product.name}</h3>
          <StatusBadge status={product.status} />
        </div>
        <p className="text-xs font-medium text-muted-foreground">{product.category}</p>
        <div className="mt-3 flex items-end justify-between gap-2">
          <p className="text-lg font-black tabular-nums text-brand">{product.price.toLocaleString("fr-FR")} FCFA</p>
          <p className="flex items-center gap-0.5 text-xs font-semibold text-amber-600">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" aria-hidden />
            {product.rating}
          </p>
        </div>
        <div className="mt-4 flex gap-2">
          <Link
            href="/produits"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2.5 text-center text-sm font-semibold transition hover:border-brand/40 hover:bg-orange-50/50"
          >
            Details
          </Link>
          <Link
            href="/produits"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand px-3 py-2.5 text-sm font-bold text-brand-contrast shadow-md shadow-orange-500/20 transition hover:brightness-105"
          >
            <ShoppingCart className="h-4 w-4" aria-hidden />
            Panier
          </Link>
        </div>
        <Link
          href="/connexion"
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-brand"
        >
          <Heart className="h-3.5 w-3.5" aria-hidden />
          Favoris (connexion)
        </Link>
      </div>
    </article>
  );
}
