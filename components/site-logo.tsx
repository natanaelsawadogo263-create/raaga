import Image from "next/image";
import Link from "next/link";

type SiteLogoProps = {
  /** Taille visuelle (hauteur), largeur suivie automatiquement */
  className?: string;
};

export function SiteLogo({ className = "" }: SiteLogoProps) {
  return (
    <Link
      href="/"
      className={`relative inline-flex shrink-0 items-center ${className}`}
      aria-label="Raaga — Accueil"
    >
      <Image
        src="/logorg.png"
        alt="Raaga"
        width={720}
        height={216}
        priority
        className="h-11 w-auto object-contain object-left sm:h-12 md:h-14"
      />
    </Link>
  );
}

/** Variante footer : alignée en hauteur avec les colonnes titre + liens */
export function SiteLogoFooter({ className = "" }: SiteLogoProps) {
  return (
    <Link href="/" className={`inline-flex items-center leading-none ${className}`} aria-label="Raaga — Accueil">
      <Image
        src="/logorg.png"
        alt="Raaga"
        width={600}
        height={180}
        className="h-[3.75rem] w-auto object-contain object-left sm:h-16 md:h-[4.5rem]"
      />
    </Link>
  );
}
