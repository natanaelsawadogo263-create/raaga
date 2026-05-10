"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Carrousel d’images : index actif, navigation circulaire, défilement des miniatures.
 */
export function useImageCarousel(sources: readonly string[]) {
  const safe = useMemo(
    () => sources.map((s) => s.trim()).filter((s): s is string => Boolean(s)),
    [sources],
  );
  const n = safe.length;
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (n === 0) return;
    if (active >= n) setActive(0);
  }, [active, n]);

  const goPrev = useCallback(() => {
    if (n < 2) return;
    setActive((i) => (i - 1 + n) % n);
  }, [n]);

  const goNext = useCallback(() => {
    if (n < 2) return;
    setActive((i) => (i + 1) % n);
  }, [n]);

  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const setThumbRef = useCallback((index: number, el: HTMLButtonElement | null) => {
    thumbRefs.current[index] = el;
  }, []);

  useEffect(() => {
    thumbRefs.current[active]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [active]);

  const current = safe[active] ?? safe[0];

  return {
    safe,
    active,
    setActive,
    goPrev,
    goNext,
    multi: n > 1,
    count: n,
    current,
    setThumbRef,
  };
}
