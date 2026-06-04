"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RAAGA_GUEST_CART_CHANGED, guestCartItemCount } from "@/lib/guest-cart";

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h2l2.3 10.3a2 2 0 0 0 2 1.7h8.4a2 2 0 0 0 2-1.5L21 7H7.2" />
    </svg>
  );
}

type Props = {
  isCustomer: boolean;
  serverCount: number;
  className?: string;
};

export function CartIconBadge({ isCustomer, serverCount, className }: Props) {
  const [guestCount, setGuestCount] = useState(0);

  useEffect(() => {
    if (isCustomer) {
      return;
    }
    const sync = () => setGuestCount(guestCartItemCount());
    sync();
    window.addEventListener(RAAGA_GUEST_CART_CHANGED, sync);
    return () => window.removeEventListener(RAAGA_GUEST_CART_CHANGED, sync);
  }, [isCustomer]);

  const count = isCustomer ? serverCount : guestCount;
  const [pop, setPop] = useState(false);
  const [prevCount, setPrevCount] = useState(count);

  useEffect(() => {
    if (count !== prevCount) {
      setPrevCount(count);
      if (count > 0) {
        setPop(true);
        const t = window.setTimeout(() => setPop(false), 500);
        return () => window.clearTimeout(t);
      }
    }
  }, [count, prevCount]);

  return (
    <Link
      href="/panier"
      aria-label="Panier"
      className={className ?? "relative p-1.5 text-foreground transition hover:text-brand"}
    >
      <CartIcon />
      {count > 0 ? (
        <span
          key={count}
          className={`absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-brand-contrast ${
            pop ? "motion-safe:animate-cart-badge-pop" : ""
          }`}
        >
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
