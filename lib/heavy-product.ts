/** Frais de livraison standard (produits normaux uniquement). */
export const STANDARD_DELIVERY_FEE_CFA = 1000;

export const HEAVY_PRODUCT_LABEL = "Produit poids lourd";

export const HEAVY_DELIVERY_MESSAGE =
  "Livraison spéciale ou retrait disponible — contactez Raaga après commande";

export type CartDeliverySummary = {
  deliveryFeeCfa: number;
  hasHeavyItems: boolean;
  /** Libellé affiché à la place de « Livraison 1 000 FCFA » si poids lourd. */
  deliveryLabel: string | null;
};

export function computeCartDelivery(hasHeavyItems: boolean, itemCount: number): CartDeliverySummary {
  if (!itemCount) {
    return { deliveryFeeCfa: 0, hasHeavyItems: false, deliveryLabel: null };
  }
  if (hasHeavyItems) {
    return {
      deliveryFeeCfa: 0,
      hasHeavyItems: true,
      deliveryLabel: HEAVY_DELIVERY_MESSAGE,
    };
  }
  return {
    deliveryFeeCfa: STANDARD_DELIVERY_FEE_CFA,
    hasHeavyItems: false,
    deliveryLabel: null,
  };
}

export function cartHasHeavyProduct(
  items: { is_heavy?: boolean | null }[],
): boolean {
  return items.some((p) => p.is_heavy === true);
}
