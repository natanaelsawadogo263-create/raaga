import { Package } from "lucide-react";
import { HEAVY_PRODUCT_LABEL } from "@/lib/heavy-product";

type HeavyProductBadgeProps = {
  /** `card` : sous l’image ; `inline` : bloc discret sous la galerie */
  variant?: "card" | "inline";
};

export function HeavyProductBadge({ variant = "card" }: HeavyProductBadgeProps) {
  if (variant === "inline") {
    return (
      <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[11px] font-semibold text-amber-900 sm:text-xs">
        <Package className="h-3.5 w-3.5 shrink-0 text-amber-700" aria-hidden />
        {HEAVY_PRODUCT_LABEL}
      </p>
    );
  }

  return (
    <span className="absolute bottom-2 left-2 right-2 z-10 flex items-center justify-center gap-1 rounded-lg bg-amber-950/88 px-2 py-1 text-[10px] font-bold text-amber-50 shadow-sm backdrop-blur-[2px] sm:text-[11px]">
      <Package className="h-3 w-3 shrink-0 opacity-90" aria-hidden />
      {HEAVY_PRODUCT_LABEL}
    </span>
  );
}
