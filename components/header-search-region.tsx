"use client";

import { Search } from "lucide-react";
import { Suspense, startTransition, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { HeaderSearch } from "@/components/header-search";

export function HeaderSearchRegion() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    startTransition(() => {
      const q = searchParams.get("q")?.trim() ?? "";
      if (pathname === "/produits" && q) {
        setMobileExpanded(true);
      } else if (pathname !== "/produits") {
        setMobileExpanded(false);
      }
    });
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!mobileExpanded) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileExpanded(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileExpanded]);

  useEffect(() => {
    if (!mobileExpanded) {
      return;
    }
    requestAnimationFrame(() => {
      document.getElementById("nav-search")?.focus();
    });
  }, [mobileExpanded]);

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        onClick={() => setMobileExpanded((v) => !v)}
        aria-expanded={mobileExpanded}
        aria-controls="header-search-panel"
        aria-label={mobileExpanded ? "Fermer la recherche" : "Ouvrir la recherche"}
        className="ml-auto flex shrink-0 rounded-lg p-1.5 text-foreground transition hover:bg-muted/80 active:opacity-80 md:hidden"
      >
        <Search className="h-4 w-4" strokeWidth={2} aria-hidden />
      </button>

      <div
        id="header-search-panel"
        className={`order-3 min-w-0 w-full shrink-0 md:order-none md:block md:w-auto md:max-w-md md:flex-1 lg:max-w-lg ${
          mobileExpanded ? "block" : "hidden md:block"
        }`}
      >
        <Suspense fallback={<div className="h-8 w-full animate-pulse rounded-xl bg-muted/80 md:h-9" aria-hidden />}>
          <HeaderSearch />
        </Suspense>
      </div>
    </>
  );
}
