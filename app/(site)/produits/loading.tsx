import { ProductGridSkeleton } from "@/components/ui/product-grid-skeleton";

export default function ProduitsLoading() {
  return (
    <div className="mx-auto w-[min(1320px,calc(100%-2rem))] py-6 sm:py-10">
      <div className="mb-6 h-5 w-40 animate-shimmer rounded-md bg-muted motion-safe:animate-fade-in" />
      <ProductGridSkeleton count={12} />
    </div>
  );
}
