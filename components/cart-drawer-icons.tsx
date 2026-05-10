import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { className?: string };

/** Panier / sac — traits équilibrés, coins arrondis (style produit premium). */
export function IconCartPremium({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden {...props}>
      <path
        d="M9 2.75v2.5M15 2.75v2.5"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
      />
      <path
        d="M4.25 8.25h15.5l-1.35 13.15a1.85 1.85 0 01-1.84 1.65H7.44a1.85 1.85 0 01-1.84-1.65L4.25 8.25z"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinejoin="round"
      />
      <path
        d="M4.25 8.25 5.85 4.5h12.3l1.6 3.75"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Colis produit — perspective légère pour les lignes d’article. */
export function IconParcel({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden {...props}>
      <path
        d="M12 2.25 20.25 6.5v11L12 21.75 3.75 17.5v-11L12 2.25z"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinejoin="round"
      />
      <path d="M3.75 6.5 12 10.75 20.25 6.5" stroke="currentColor" strokeWidth="1.65" strokeLinejoin="round" />
      <path d="M12 10.75v11" stroke="currentColor" strokeWidth="1.65" strokeLinejoin="round" />
    </svg>
  );
}

/** Fermeture — cercle discret type UI native pro. */
export function IconDismiss({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden {...props}>
      <path
        d="M8.5 8.5l7 7M15.5 8.5l-7 7"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
      />
    </svg>
  );
}
