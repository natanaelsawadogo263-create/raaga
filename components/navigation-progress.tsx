"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

/** Barre orange en haut de l’écran pendant les changements de page. */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(true);
    const t = window.setTimeout(() => setActive(false), 900);
    return () => window.clearTimeout(t);
  }, [pathname, searchParams]);

  if (!active) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-0.5 origin-left bg-brand shadow-[0_0_12px_rgba(255,122,0,0.6)] motion-safe:animate-nav-progress"
      role="progressbar"
      aria-hidden
    />
  );
}
