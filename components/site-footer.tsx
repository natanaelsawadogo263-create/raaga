import Link from "next/link";
import { FooterSocialLinks } from "@/components/footer-social-links";
import { SiteLogoFooter } from "@/components/site-logo";

const explore = [
  { href: "/", label: "Accueil" },
  { href: "/produits", label: "Produits" },
  { href: "/a-propos", label: "A propos" },
  { href: "/faq", label: "FAQ" },
];

const support = [
  { href: "/contact", label: "Contact" },
  { href: "/aide", label: "Aide" },
];

const legal = [
  { href: "#", label: "Conditions d’utilisation" },
  { href: "#", label: "Confidentialite" },
];

const headingClass = "text-xs font-bold uppercase tracking-wider text-muted-foreground leading-tight";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card/95 backdrop-blur md:pb-0">
      <div className="container-raaga mx-auto max-w-5xl py-10 pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))] md:py-12 md:pb-12">
        {/* Mobile / tablette : pile classique */}
        <div className="footer-bridge grid items-start gap-10 sm:grid-cols-2 lg:hidden">
          <div className="flex max-w-xs flex-col gap-4">
            <SiteLogoFooter />
            <FooterSocialLinks className="mt-0" />
          </div>
          <div>
            <p className={headingClass}>Explorer</p>
            <ul className="mt-4 space-y-2.5 text-sm font-medium">
              {explore.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-foreground transition hover:text-brand">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className={headingClass}>Support</p>
            <ul className="mt-4 space-y-2.5 text-sm font-medium">
              {support.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-foreground transition hover:text-brand">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className={headingClass}>Legal</p>
            <ul className="mt-4 space-y-2.5 text-sm font-medium text-muted-foreground">
              {legal.map((link) => (
                <li key={link.label}>
                  <span className="cursor-not-allowed">{link.label}</span>
                  <span className="ml-1 text-[10px] font-semibold uppercase text-brand">Bientot</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              Email :{" "}
              <a href="mailto:contactraagabf@gmail.com" className="font-semibold text-foreground hover:text-brand">
                contactraagabf@gmail.com
              </a>
            </p>
          </div>
        </div>

        {/* Desktop : une grille 2 lignes — ligne 1 = titres + logo, ligne 2 = listes + réseaux (même ligne de base) */}
        <div className="footer-desktop hidden gap-x-6 gap-y-4 lg:grid lg:grid-cols-4 lg:items-start">
          <div className="flex min-w-0 items-start">
            <SiteLogoFooter />
          </div>
          <p className={headingClass}>Explorer</p>
          <p className={headingClass}>Support</p>
          <p className={headingClass}>Legal</p>

          <FooterSocialLinks className="mt-0 min-w-0" />
          <ul className="space-y-2.5 text-sm font-medium">
            {explore.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-foreground transition hover:text-brand">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="space-y-2.5 text-sm font-medium">
            {support.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-foreground transition hover:text-brand">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="min-w-0">
            <ul className="space-y-2.5 text-sm font-medium text-muted-foreground">
              {legal.map((link) => (
                <li key={link.label}>
                  <span className="cursor-not-allowed">{link.label}</span>
                  <span className="ml-1 text-[10px] font-semibold uppercase text-brand">Bientot</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              Email :{" "}
              <a href="mailto:contactraagabf@gmail.com" className="font-semibold text-foreground hover:text-brand">
                contactraagabf@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
