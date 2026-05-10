"use client";

import { Package } from "lucide-react";
import { ImageCarousel } from "@/components/image-carousel";

type ProductGalleryProps = {
  images: string[];
  productName: string;
  /** Réduit hauteur / marges pour fiche produit plus dense */
  compact?: boolean;
};

const STAGE =
  "aspect-square w-full overflow-hidden rounded-3xl border border-border/70 bg-muted/40 shadow-[0_24px_48px_-20px_rgba(15,23,42,0.2)] ring-1 ring-black/[0.04]";
/** Largeur max gérée par le conteneur parent (fiche produit). */
const STAGE_COMPACT =
  "aspect-square w-full overflow-hidden rounded-2xl border border-border/70 bg-muted/40 shadow-[0_12px_32px_-16px_rgba(15,23,42,0.18)] ring-1 ring-black/[0.04]";

const EMPTY =
  "flex aspect-square w-full items-center justify-center rounded-3xl border border-border/80 bg-gradient-to-br from-orange-50 via-muted to-amber-50/60 shadow-inner";

export function ProductGallery({ images, productName, compact = false }: ProductGalleryProps) {
  return (
    <ImageCarousel
      images={images}
      ariaRegionLabel={`Photos du produit : ${productName}`}
      getMainAlt={(i, n) => `${productName} — photo ${i + 1} sur ${n}`}
      mainSizes="(max-width: 1024px) min(320px, 100vw), 320px"
      priority
      compact={compact}
      stageClassName={compact ? STAGE_COMPACT : STAGE}
      emptySlot={
        <div className={EMPTY}>
          <Package className="h-20 w-20 text-orange-200" strokeWidth={1.15} aria-hidden />
        </div>
      }
    />
  );
}
