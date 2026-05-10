"use client";

import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { btnPrimaryClass } from "@/components/raaga/page-shell";

type ProductVariantOption = {
  name: string;
  values: string[];
};

type ProductQuantityAddProps = {
  productId: string;
  maxQty: number;
  disabled?: boolean;
  variantOptions?: ProductVariantOption[];
};

export function ProductQuantityAdd({
  productId,
  maxQty,
  disabled = false,
  variantOptions = [],
}: ProductQuantityAddProps) {
  const [qty, setQty] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const opt of variantOptions) {
      if (opt.values[0]) {
        init[opt.name] = opt.values[0];
      }
    }
    return init;
  });
  const cap = Math.max(0, maxQty);
  const out = disabled || cap <= 0;
  const clamped = out ? 1 : Math.min(Math.max(1, qty), cap);
  const hasVariantOptions = variantOptions.length > 0;

  const dec = () => {
    if (!out) {
      setQty((q) => Math.max(1, q - 1));
    }
  };
  const inc = () => {
    if (!out) {
      setQty((q) => Math.min(cap, q + 1));
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap">
      {hasVariantOptions ? (
        <div className="w-full space-y-2">
          {variantOptions.map((opt) => (
            <label key={opt.name} className="block">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                {opt.name}
              </span>
              <select
                className="h-9 w-full rounded-lg border border-border/80 bg-card px-3 text-sm text-foreground sm:max-w-[240px]"
                value={selectedOptions[opt.name] ?? ""}
                onChange={(e) =>
                  setSelectedOptions((prev) => ({
                    ...prev,
                    [opt.name]: e.target.value,
                  }))
                }
              >
                {opt.values.map((value) => (
                  <option key={`${opt.name}-${value}`} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      ) : null}

      <div>
        <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Quantité</p>
        <div className="inline-flex items-center rounded-xl border border-border/90 bg-card p-0.5 shadow-sm ring-1 ring-black/[0.04]">
          <button
            type="button"
            onClick={dec}
            disabled={out || clamped <= 1}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition hover:bg-muted/80 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Diminuer la quantité"
          >
            <Minus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          </button>
          <span className="min-w-[2.25rem] text-center text-sm font-black tabular-nums text-foreground">{clamped}</span>
          <button
            type="button"
            onClick={inc}
            disabled={out || clamped >= cap}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition hover:bg-muted/80 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Augmenter la quantité"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          </button>
        </div>
      </div>

      <div className="flex-1">
        <AddToCartButton
          productId={productId}
          quantity={clamped}
          disabled={out}
          className={`${btnPrimaryClass} h-10 w-full min-h-10 gap-2 px-6 text-sm shadow-orange-500/30 sm:w-auto sm:min-w-[12rem]`}
        >
          <ShoppingCart className="h-4 w-4" aria-hidden />
          Ajouter au panier
        </AddToCartButton>
      </div>
    </div>
  );
}
