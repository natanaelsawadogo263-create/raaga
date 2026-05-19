import Image from "next/image";
import Link from "next/link";
import { ChevronRight, MapPinned, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { HomeHeroBanner } from "@/components/home-hero-banner";
import { HomeSectionHeader } from "@/components/home-section-header";
import { fetchHomeCategoryCards } from "@/lib/catalog-categories";
import { appHighlights } from "@/lib/raaga-data";

const highlightMeta = [
  { icon: Wallet },
  { icon: MapPinned },
  { icon: ShieldCheck },
];

export default async function Home() {
  const categoryCards = await fetchHomeCategoryCards();

  return (
    <div className="relative pb-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(249,115,22,0.18),transparent_55%)]"
      />

      <HomeHeroBanner />

      {categoryCards.length > 0 ? (
        <section className="container-raaga mt-14">
          <HomeSectionHeader
            eyebrow="Catalogue"
            title="Nos catégories"
            description="Parcourez les univers que vous avez configurés et accédez directement aux produits associés."
            extra={
              <Link
                href="/produits"
                className="inline-flex items-center gap-1 text-sm font-bold text-brand hover:underline"
              >
                Tout le catalogue
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Link>
            }
          />
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {categoryCards.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm ring-1 ring-black/[0.03] transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-lg hover:shadow-orange-500/10"
              >
                <div className="relative aspect-[5/4] w-full overflow-hidden bg-muted">
                  <Image
                    src={cat.imageUrl}
                    alt={cat.imageAlt}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"
                  />
                  <span className="absolute bottom-3 left-3 right-3 text-sm font-black leading-tight text-white drop-shadow-sm sm:text-[15px]">
                    {cat.name}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                  <span className="text-[11px] font-semibold text-muted-foreground transition group-hover:text-foreground">
                    Voir les articles
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-xs font-bold text-brand transition group-hover:translate-x-0.5">
                    Explorer
                    <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="container-raaga mt-16">
        <HomeSectionHeader
          eyebrow="Confiance"
          title="Pourquoi choisir Raaga ?"
          description="Des fondations locales pour un e-commerce qui tient la route au quotidien."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {appHighlights.map((item, i) => {
            const Icon = highlightMeta[i]?.icon ?? Sparkles;
            return (
              <article
                key={item.title}
                className="flex gap-4 rounded-2xl border border-border/80 bg-card p-5 shadow-sm ring-1 ring-black/[0.03] transition hover:border-brand/20"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-brand ring-1 ring-orange-100">
                  <Icon className="h-6 w-6" strokeWidth={2} aria-hidden />
                </span>
                <div>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
