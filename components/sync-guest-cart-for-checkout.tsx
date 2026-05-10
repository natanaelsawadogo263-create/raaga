"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { mergeGuestCartToDbAction } from "@/app/actions";
import { clearGuestCart, getGuestCartLines } from "@/lib/guest-cart";

/**
 * Assure que le panier local est fusionné dans la base avant l’affichage du formulaire
 * (les effets des composants enfants s’exécutent avant ceux du layout).
 */
export function SyncGuestCartForCheckout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const lines = getGuestCartLines();
    if (!lines.length) {
      setReady(true);
      return;
    }
    mergeGuestCartToDbAction(lines)
      .then(() => {
        clearGuestCart();
        if (!cancelled) {
          router.refresh();
        }
      })
      .catch(() => {
        /* mergeGuestCartToDbAction échoue si session invalide — la page serveur gère le reste */
      })
      .finally(() => {
        if (!cancelled) {
          setReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Préparation de votre panier…
      </p>
    );
  }

  return <>{children}</>;
}
