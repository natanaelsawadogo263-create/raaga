import type { CatalogProduct } from "@/lib/catalog-products";

function formatFcfa(n: number) {
  return n.toLocaleString("fr-FR");
}

export function ProductPromoPrices({
  product,
  variant,
}: {
  product: CatalogProduct;
  variant: "card" | "detail";
}) {
  const isPromo = product.status === "promotion";
  const ref = product.compareAtPriceCfa;
  const showStruck = Boolean(isPromo && ref != null && ref > product.price);

  if (variant === "detail") {
    return (
      <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        {showStruck ? (
          <p className="text-lg font-bold tabular-nums text-muted-foreground line-through decoration-foreground/35 sm:text-xl">
            {formatFcfa(ref!)} <span className="text-sm font-semibold">FCFA</span>
          </p>
        ) : null}
        <p className="text-3xl font-black tabular-nums tracking-tight text-brand sm:text-[2rem] lg:text-[2.15rem]">
          {formatFcfa(product.price)} <span className="text-lg font-bold text-brand/85 sm:text-xl">FCFA</span>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      {showStruck ? (
        <p className="text-sm font-bold tabular-nums text-muted-foreground line-through decoration-foreground/40">
          {formatFcfa(ref!)} <span className="text-[10px] font-semibold">FCFA</span>
        </p>
      ) : null}
      <p className="text-xl font-black tabular-nums tracking-tight text-brand">
        {formatFcfa(product.price)} <span className="text-xs font-bold text-brand/85">FCFA</span>
      </p>
    </div>
  );
}
