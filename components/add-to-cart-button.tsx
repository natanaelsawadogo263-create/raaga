"use client";

import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition, type ReactNode } from "react";
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
      router.refresh();
      openCart();
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || pending}
      className={className}
    >
      {children ?? (
        <>
          <ShoppingCart className="h-4 w-4" aria-hidden />
          Panier
        </>
      )}
    </button>
  );
}
