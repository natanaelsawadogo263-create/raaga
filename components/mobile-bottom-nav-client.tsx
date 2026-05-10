"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { guestCartItemCount, RAAGA_GUEST_CART_CHANGED } from "@/lib/guest-cart";

export type MobileBottomNavItem = {
  href: string;
  label: string;
  icon: "home" | "grid" | "cart" | "user";
};

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.25 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6" />
      <path d="M4 10.5 12 3l8 7.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-9.5Z" />
    </svg>
  );
}

/** Grille catalogue — distinct du panier */
function CatalogGridIcon({ active }: { active: boolean }) {
  const sw = active ? 2.25 : 2;
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function CartIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.25 : 2}
    >
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h2l2.3 10.3a2 2 0 0 0 2 1.7h8.4a2 2 0 0 0 2-1.5L21 7H7.2" />
    </svg>
  );
}

function UserIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.25 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20a8 8 0 0 1 16 0" />
    </svg>
  );
}

function TabIcon({ kind, active }: { kind: MobileBottomNavItem["icon"]; active: boolean }) {
  switch (kind) {
    case "home":
      return <HomeIcon active={active} />;
    case "grid":
      return <CatalogGridIcon active={active} />;
    case "cart":
      return <CartIcon active={active} />;
    case "user":
      return <UserIcon active={active} />;
    default:
      return null;
  }
}

type Props = {
  items: MobileBottomNavItem[];
  isCustomer: boolean;
  serverCartCount: number;
};

export function MobileBottomNavClient({ items, isCustomer, serverCartCount }: Props) {
  const pathname = usePathname() ?? "/";
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [guestCount, setGuestCount] = useState(0);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  useEffect(() => {
    if (isCustomer) {
      return;
    }
    const sync = () => setGuestCount(guestCartItemCount());
    sync();
    window.addEventListener(RAAGA_GUEST_CART_CHANGED, sync);
    return () => window.removeEventListener(RAAGA_GUEST_CART_CHANGED, sync);
  }, [isCustomer]);

  const cartCount = isCustomer ? serverCartCount : guestCount;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/90 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] backdrop-blur-md md:hidden"
      aria-label="Navigation principale"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1">
        {items.map((item) => {
          const active = pendingHref ? pendingHref === item.href : isActive(pathname, item.href);
          const showCartBadge = item.icon === "cart" && cartCount > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              onPointerDown={() => setPendingHref(item.href)}
              className={`relative flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 transition-colors active:opacity-80 ${
                active ? "text-brand" : "text-muted-foreground"
              }`}
            >
              <span
                aria-hidden
                className={`absolute -top-0.5 h-0.5 w-8 rounded-full bg-brand transition-transform duration-300 ${
                  active ? "scale-x-100" : "scale-x-0"
                }`}
              />
              <span className="relative flex h-7 items-center justify-center">
                <TabIcon kind={item.icon} active={active} />
                {showCartBadge ? (
                  <span className="absolute -right-2 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold leading-none text-brand-contrast">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                ) : null}
              </span>
              <span className="max-w-full truncate px-0.5 text-[10px] font-semibold leading-tight tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
