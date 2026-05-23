/** Ligne « Livraison » du récap panier (montant standard ou message poids lourd). */
export function CartDeliveryLine({
  deliveryFee,
  deliveryLabel,
  className = "",
}: {
  deliveryFee: number;
  deliveryLabel?: string | null;
  className?: string;
}) {
  return (
    <p className={`flex justify-between gap-4 ${className}`.trim()}>
      <span className="text-muted-foreground">Livraison</span>
      {deliveryLabel ? (
        <span className="max-w-[58%] text-right text-[11px] font-semibold leading-snug text-amber-900 sm:text-xs">
          {deliveryLabel}
        </span>
      ) : (
        <span className="font-semibold tabular-nums">{deliveryFee.toLocaleString("fr-FR")} FCFA</span>
      )}
    </p>
  );
}
