import Link from "next/link";
import Image from "next/image";
import { InstallPwaButton } from "@/components/install-pwa-button";

const paymentBadges = ["Paiement à la livraison"];

export function HomeHeroBanner() {
  return (
    <section className="container-raaga pt-7" aria-labelledby="hero-heading">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-orange-700 shadow-2xl shadow-orange-900/20 ring-1 ring-black/5">
        <Image
          src="/banner.png"
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1120px"
          className="pointer-events-none absolute inset-0 object-cover object-center"
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-950/80 via-orange-900/65 to-orange-800/55" />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-orange-500/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.9)_1px,transparent_0)] [background-size:20px_20px]"
        />

        <div className="relative p-6 sm:p-8 lg:p-10">
          <div className="text-white">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wide backdrop-blur-sm sm:text-xs">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-orange-200" />
                Promo du moment
              </span>
              <span className="rounded-full bg-orange-200 px-3 py-1 text-[11px] font-black text-orange-950 shadow-sm sm:text-xs">
                Livraison des 1 000 FCFA
              </span>
            </div>

            <h1 id="hero-heading" className="mt-5 max-w-3xl text-balance text-3xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.25rem]">
              Achetez local. <span className="text-orange-200">Livrez vite.</span> Payez à la réception.
            </h1>

            <div className="mt-5 flex flex-wrap gap-2">
              {paymentBadges.map((label) => (
                <span
                  key={label}
                  className="rounded-lg border border-white/25 bg-white/10 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md sm:text-xs"
                >
                  {label}
                </span>
              ))}
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                href="/produits"
                className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-2xl bg-brand px-6 text-sm font-black text-brand-contrast shadow-lg shadow-orange-900/35 transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Voir les offres du jour
              </Link>
              <InstallPwaButton className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-2xl border-2 border-white/80 bg-white/15 px-6 text-sm font-bold text-white shadow-sm backdrop-blur-sm transition hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                Télécharger l&apos;application
              </InstallPwaButton>
            </div>

            <p className="mt-3 text-center text-[11px] font-medium text-orange-100/90 sm:text-left sm:text-xs">
              Sans frais caches · Suivi en direct · Support client reactif
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-white/15 pt-6">
              <div className="flex -space-x-2" aria-hidden>
                {["bg-orange-200", "bg-orange-100", "bg-white"].map((bg, i) => (
                  <span
                    key={bg}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-orange-600 text-[10px] font-black text-orange-900 ${bg}`}
                  >
                    {i + 1}k
                  </span>
                ))}
              </div>
              <div className="text-left">
                <p className="text-sm font-bold">Ils commandent deja avec Raaga</p>
                <p className="text-xs text-orange-100/90">Clients, boutiques et livreurs sur le meme reseau.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
