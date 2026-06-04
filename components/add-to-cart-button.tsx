"use client";

import { Check, Loader2, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type ReactNode } from "react";
import { addToCartAction } from "@/app/actions";
import { useCartDrawer } from "@/components/cart-drawer";
import { useCustomerCart } from "@/components/customer-cart-context";
import { addGuestCartLine } from "@/lib/guest-cart";

type AddToCartButtonProps = {
  productId: string;
  quantity?: number;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
};

export function AddToCartButton({
  productId,
  quantity = 1,
  disabled = false,
  className,
  children,
}: AddToCartButtonProps) {
  const router = useRouter();
  const { openCart } = useCartDrawer();
  const { isCustomer } = useCustomerCart();
  const [pending, startTransition] = useTransition();
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!justAdded) return;
    const t = window.setTimeout(() => setJustAdded(false), 1400);
    return () => window.clearTimeout(t);
  }, [justAdded]);

  const onClick = () => {
    startTransition(async () => {
      if (isCustomer) {
        const fd = new FormData();
        fd.set("product_id", productId);
        fd.set("quantity", String(quantity));
        await addToCartAction(fd);
      } else {
        addGuestCartLine(productId, quantity);
      }
      setJustAdded(true);
      router.refresh();
      openCart();
    });
  };

  const defaultLabel = pending ? (
    <>
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      Ajout…
    </>
  ) : justAdded ? (
    <>
      <Check className="h-4 w-4 motion-safe:animate-fade-in" aria-hidden />
      Ajouté !
    </>
  ) : (
    <>
      <ShoppingCart className="h-4 w-4" aria-hidden />
      Panier
    </>
  );

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || pending}
      className={`${className ?? ""} ${justAdded ? "motion-safe:scale-[1.02]" : ""} transition-transform duration-200`.trim()}
    >
      {children ?? defaultLabel}
    </button>
  );
}
