import { HeartHandshake, Rocket, Target } from "lucide-react";
import Link from "next/link";
import { PageHeader, PageShell, RaCard, btnPrimaryClass, btnSecondaryClass } from "@/components/raaga/page-shell";

export default function AProposPage() {
  return (
    <PageShell>
      <div className="container-raaga py-6 sm:py-10">
        <PageHeader
          eyebrow="Raaga"
          title="A propos de Raaga"
          description="Nous facilitons le commerce local au Burkina Faso en connectant clients, boutiques partenaires et livreurs verifies sur une plateforme mobile-first, serieuse et proche du terrain."
        >
          <Link href="/produits" className={btnPrimaryClass}>
            Voir le catalogue
          </Link>
          <Link href="/contact" className={btnSecondaryClass}>
            Parler a l’equipe
          </Link>
        </PageHeader>

        <div className="grid gap-5 md:grid-cols-3">
          <RaCard padding="p-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-orange-600 text-white shadow-lg shadow-orange-500/25">
              <Target className="h-6 w-6" aria-hidden />
            </span>
            <h2 className="mt-4 text-lg font-black text-foreground">Mission</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Rendre les achats locaux simples, rapides et suivis de bout en bout — du clic a la reception du colis.
            </p>
          </RaCard>
          <RaCard padding="p-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-600 text-white shadow-lg">
              <Rocket className="h-6 w-6" aria-hidden />
            </span>
            <h2 className="mt-4 text-lg font-black text-foreground">Vision</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Un ecosysteme e-commerce et logistique evolutif, avec des standards de confiance dignes d’une plateforme internationale, ancre localement.
            </p>
          </RaCard>
          <RaCard padding="p-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg">
              <HeartHandshake className="h-6 w-6" aria-hidden />
            </span>
            <h2 className="mt-4 text-lg font-black text-foreground">Valeurs</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Confiance, proximite, transparence sur les statuts et la remise des colis, et exigence sur la qualite de service.
            </p>
          </RaCard>
        </div>

        <RaCard className="mt-10 border-orange-200/60 bg-gradient-to-br from-orange-50/80 to-card" padding="p-8 sm:p-10">
          <h2 className="text-xl font-black text-foreground">Pour les boutiques et les livreurs</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Raaga structure les flux : visibilite des produits, preparation en boutique, course optimisee et preuve de livraison par code secret. Chaque acteur garde une lecture claire de son role.
          </p>
        </RaCard>
      </div>
    </PageShell>
  );
}
