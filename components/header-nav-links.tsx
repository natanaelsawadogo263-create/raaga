"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavItem = {
  href: string;
  label: string;
};

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function HeaderNavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname() ?? "/";
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  return (
    <nav className="flex items-center gap-5 text-sm font-medium">
      {items.map((item) => {
        const active = pendingHref ? pendingHref === item.href : isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onPointerDown={() => setPendingHref(item.href)}
            className={`group relative pb-1 transition-colors ${
              active ? "text-brand" : "text-foreground"
            }`}
          >
            {item.label}
            <span
              aria-hidden
              className={`absolute bottom-0 left-0 h-0.5 w-full origin-left rounded-full bg-brand transition-transform duration-300 ${
                active ? "scale-x-100" : "scale-x-0"
              }`}
            />
          </Link>
        );
      })}
    </nav>
  );
}
