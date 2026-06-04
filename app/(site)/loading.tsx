import { ProductGridSkeleton } from "@/components/ui/product-grid-skeleton";

export default function SiteLoading() {
  return (
    <div className="container-raaga py-8 sm:py-12">
      <div className="h-64 animate-shimmer rounded-[2rem] bg-gradient-to-br from-orange-100 via-muted to-orange-50 sm:h-72" />
      <div className="mt-14 h-8 w-48 animate-shimmer rounded-lg bg-muted" />
      <div className="mt-6">
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}
