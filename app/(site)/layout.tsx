import { Suspense } from "react";
import { CartDrawerProvider } from "@/components/cart-drawer";
import { NavigationProgress } from "@/components/navigation-progress";
import { CustomerCartProvider, GuestCartMergeOnLogin } from "@/components/customer-cart-context";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSiteCartBadge } from "@/lib/site-cart-server";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { isCustomer } = await getSiteCartBadge();

  return (
    <CustomerCartProvider isCustomer={isCustomer}>
      <GuestCartMergeOnLogin isCustomer={isCustomer} />
      <CartDrawerProvider>
        <div className="flex min-h-full flex-1 flex-col">
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          <SiteHeader />
          <main className="flex-1 pb-[calc(4.25rem+env(safe-area-inset-bottom,0px))] md:pb-0">{children}</main>
          <SiteFooter />
          <MobileBottomNav />
        </div>
      </CartDrawerProvider>
    </CustomerCartProvider>
  );
}
