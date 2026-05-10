"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { useImageCarousel } from "@/lib/hooks/use-image-carousel";

const navBtnClass =
  "absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/90 text-slate-800 shadow-md transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 sm:h-12 sm:w-12";

const navBtnCompactClass =
  "absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/90 text-slate-800 shadow-md transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 sm:h-10 sm:w-10";

export type ImageCarouselProps = {
  images: readonly string[];
  /** Texte de la région (lecteurs d’écran) */
  ariaRegionLabel: string;
  /** Alt de l’image principale */
  getMainAlt: (activeIndex: number, total: number) => string;
  mainSizes: string;
  priority?: boolean;
  /** Moins d’espace sous l’image, miniatures et flèches plus petites */
  compact?: boolean;
  className?: string;
  /** Conteneur de l’image (forme, bordure, ombre) */
  stageClassName: string;
  /** Affiché lorsqu’il n’y a aucune image */
  emptySlot: ReactNode;
};

export function ImageCarousel({
  images,
  ariaRegionLabel,
  getMainAlt,
  mainSizes,
  priority = false,
  compact = false,
  className = "",
  stageClassName,
  emptySlot,
}: ImageCarouselProps) {
  const { safe, active, setActive, goPrev, goNext, multi, count, current, setThumbRef } =
    useImageCarousel(images);

  if (!current) {
    return <div className={className}>{emptySlot}</div>;
  }

  const thumbSize = compact ? "h-12 w-12 rounded-lg" : "h-16 w-16 rounded-xl";
  const thumbPixel = compact ? "48px" : "64px";
  const navBase = compact ? navBtnCompactClass : navBtnClass;

  return (
    <div className={`${compact ? "space-y-2" : "space-y-4"} ${className}`.trim()}>
      <div
        className={`group relative outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${stageClassName}`.trim()}
        role="region"
        aria-roledescription="carrousel"
        aria-label={ariaRegionLabel}
        tabIndex={multi ? 0 : undefined}
        onKeyDown={(e) => {
          if (!multi) return;
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            goPrev();
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            goNext();
          }
        }}
      >
        <Image
          src={current}
          alt={getMainAlt(active, count)}
          fill
          priority={priority}
          sizes={mainSizes}
          className="object-cover"
        />
        {multi ? (
          <>
            <div
              className={`pointer-events-none absolute inset-x-0 flex justify-center ${compact ? "bottom-2" : "bottom-3"}`}
              aria-hidden
            >
              <span
                className={`rounded-full bg-black/45 font-semibold text-white backdrop-blur-sm ${compact ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-[11px]"}`}
              >
                {active + 1} / {count}
              </span>
            </div>
            <button
              type="button"
              onClick={goPrev}
              className={`${navBase} left-2 sm:left-3`}
              aria-label="Image précédente"
            >
              <ChevronLeft className={`${compact ? "h-5 w-5" : "h-6 w-6"} shrink-0`} strokeWidth={2} aria-hidden />
            </button>
            <button
              type="button"
              onClick={goNext}
              className={`${navBase} right-2 sm:right-3`}
              aria-label="Image suivante"
            >
              <ChevronRight className={`${compact ? "h-5 w-5" : "h-6 w-6"} shrink-0`} strokeWidth={2} aria-hidden />
            </button>
          </>
        ) : null}
      </div>
      {multi ? (
        <ul className={`flex overflow-x-auto pb-1 ${compact ? "gap-1.5" : "gap-2"}`} role="list" aria-label="Miniatures">
          {safe.map((url, i) => (
            <li key={`${url}-${i}`} className="shrink-0">
              <button
                ref={(el) => setThumbRef(i, el)}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Afficher l’image ${i + 1}`}
                aria-current={i === active ? "true" : undefined}
                className={`relative ${thumbSize} shrink-0 overflow-hidden ring-2 transition ${
                  i === active ? "ring-brand" : "ring-transparent hover:ring-border"
                }`}
              >
                <Image src={url} alt="" fill sizes={`${thumbPixel}px`} className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
