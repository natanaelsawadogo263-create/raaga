"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useTransition,
  type ReactNode,
} from "react";
import { mergeGuestCartToDbAction } from "@/app/actions";
import { clearGuestCart, getGuestCartLines } from "@/lib/guest-cart";

type CustomerCartContextValue = {
  isCustomer: boolean;
};

const CustomerCartContext = createContext<CustomerCartContextValue>({ isCustomer: false });

export function useCustomerCart() {
  return useContext(CustomerCartContext);
}

export function CustomerCartProvider({
  isCustomer,
  children,
}: {
  isCustomer: boolean;
  children: ReactNode;
}) {
  const value = useMemo(() => ({ isCustomer }), [isCustomer]);
  return <CustomerCartContext.Provider value={value}>{children}</CustomerCartContext.Provider>;
}

/** Après connexion compte client : reprend les lignes du panier navigateur. */
export function GuestCartMergeOnLogin({ isCustomer }: { isCustomer: boolean }) {
  const router = useRouter();
  const mergedOnce = useRef(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!isCustomer) {
      mergedOnce.current = false;
    }
  }, [isCustomer]);

  const runMerge = useCallback(() => {
    if (!isCustomer || mergedOnce.current) {
      return;
    }
    const lines = getGuestCartLines();
    if (!lines.length) {
      return;
    }
    mergedOnce.current = true;
    startTransition(async () => {
      try {
        await mergeGuestCartToDbAction(lines);
        clearGuestCart();
        router.refresh();
      } catch {
        mergedOnce.current = false;
      }
    });
  }, [isCustomer, router]);

  useEffect(() => {
    runMerge();
  }, [runMerge]);

  return null;
}
