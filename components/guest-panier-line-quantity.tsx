"use client";

import { Minus, Plus } from "lucide-react";
import { cartQtyStepperBtnClass, cartQtyStepperWrapClass } from "@/components/raaga/page-shell";

type GuestPanierLineQuantityProps = {
  productId: string;
  /** Quantité persistée (état local du panier invité) */
  quantity: number;
  stockQuantity: number;
  onChangeQuantity: (productId: string, nextQty: number) => void;
};

export function GuestPanierLineQuantity({ productId, quantity, stockQuantity, onChangeQuantity }: GuestPanierLineQuantityProps) {
  const cap = Math.max(0, Math.floor(stockQuantity));
  const maxQty = cap > 0 ? Math.min(cap, 999) : 999;
  const q = Math.min(Math.max(1, Math.floor(quantity)), maxQty);

  return (
    <div className={cartQtyStepperWrapClass} role="group" aria-label="Quantité">
      <button
        type="button"
        className={cartQtyStepperBtnClass}
        onClick={() => onChangeQuantity(productId, q - 1)}
        disabled={q <= 1}
        aria-label="Diminuer la quantité"
      >
        <Minus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
      </button>
      <span className="min-w-[2rem] px-1 text-center text-sm font-black tabular-nums text-foreground">{q}</span>
      <button
        type="button"
        className={cartQtyStepperBtnClass}
        onClick={() => onChangeQuantity(productId, q + 1)}
        disabled={q >= maxQty}
        aria-label="Augmenter la quantité"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
      </button>
    </div>
  );
}
