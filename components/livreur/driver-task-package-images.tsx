import { Package } from "lucide-react";
import { pickPrimaryImage, type ProductImageRow } from "@/lib/catalog-products";

export type DriverTaskPackageLine = {
  key: string;
  name: string;
  quantity: number;
  imageUrl: string | null;
};

export function driverTaskLinesFromItems(
  orderId: string,
  items: {
    quantity: number;
    products:
      | {
          name: string;
          product_images: ProductImageRow[] | null;
        }
      | {
          name: string;
          product_images: ProductImageRow[] | null;
        }[]
      | null;
  }[],
  pickOne: <T>(raw: T | T[] | null) => T | null,
): DriverTaskPackageLine[] {
  return items.map((it, i) => {
    const p = pickOne(it.products);
    const imgs = p?.product_images ?? null;
    return {
      key: `${orderId}-${i}`,
      name: p?.name?.trim() || "Article",
      quantity: it.quantity,
      imageUrl: pickPrimaryImage(imgs),
    };
  });
}

type DriverTaskPackageImagesProps = {
  lines: DriverTaskPackageLine[];
  /** `card` : grille avant acceptation ; `compact` : bandeau dashboard */
  variant?: "card" | "compact";
};

export function DriverTaskPackageImages({ lines, variant = "card" }: DriverTaskPackageImagesProps) {
  if (!lines.length) {
    return null;
  }

  const thumbClass =
    variant === "compact"
      ? "relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200/80"
      : "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200/80 sm:h-[4.5rem] sm:w-[4.5rem]";

  return (
    <div className={variant === "card" ? "mt-3" : "mt-2"}>
      {variant === "card" ? (
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
          Aperçu du colis
        </p>
      ) : null}
      <ul className="flex flex-wrap gap-2">
        {lines.map((line) => (
          <li key={line.key} className="flex flex-col items-center gap-1">
            <div className={thumbClass}>
              {line.imageUrl ? (
                // img natif : évite le blocage Next/Image sur certaines URLs Supabase
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={line.imageUrl}
                  alt={line.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[#FF7A00]/70">
                  <Package className="h-6 w-6" strokeWidth={1.5} aria-hidden />
                </span>
              )}
              <span className="absolute -bottom-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF7A00] px-1 text-[10px] font-black text-white shadow ring-2 ring-white">
                ×{line.quantity}
              </span>
            </div>
            {variant === "card" ? (
              <span className="max-w-[4.5rem] truncate text-center text-[10px] font-semibold text-slate-700">
                {line.name}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
