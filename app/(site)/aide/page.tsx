import Link from "next/link";
import { Headphones, MessageSquareText, Ticket } from "lucide-react";
import {
  AlertBanner,
  PageHeader,
  PageShell,
  RaCard,
  btnSecondaryClass,
} from "@/components/raaga/page-shell";

export default function AidePage() {
  return (
    <PageShell>
      <div className="container-raaga py-6 sm:py-10">
        <PageHeader
          eyebrow="Support"
          title="Aide et preoccupations"
          description="Systeme de tickets avec statuts clairs : ouvert, en cours, resolu. Chaque echange est conserve pour l’administrateur."
        />

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <RaCard padding="p-5">
            <Ticket className="h-8 w-8 text-brand" strokeWidth={1.75} aria-hidden />
            <p className="mt-3 text-sm font-bold text-foreground">Ticket actif</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">#RG-1024</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Statut : <span className="font-semibold text-amber-700">En cours de traitement</span>. Reponse sous 24h ouvrables.
            </p>
          </RaCard>
          <RaCard padding="p-5">
            <MessageSquareText className="h-8 w-8 text-brand" strokeWidth={1.75} aria-hidden />
            <p className="mt-3 text-sm font-bold text-foreground">Pieces jointes</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Photos, captures ecran et messages sont bientot disponibles pour appuyer votre demande.
            </p>
          </RaCard>
          <RaCard padding="p-5">
            <Headphones className="h-8 w-8 text-brand" strokeWidth={1.75} aria-hidden />
            <p className="mt-3 text-sm font-bold text-foreground">Canal direct</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Pour une reponse immediate, passez aussi par la page Contact (telephone / WhatsApp).
            </p>
            <Link href="/contact" className={`${btnSecondaryClass} mt-4 w-full text-xs`}>
              Contacter Raaga
            </Link>
          </RaCard>
        </div>

        <AlertBanner variant="info" title="Roadmap produit">
          <p>
            La creation de tickets en ligne et le suivi des echanges seront branches sur Supabase dans une prochaine iteration — l’experience visuelle
            est deja alignee avec le cahier des charges.
          </p>
        </AlertBanner>
      </div>
    </PageShell>
  );
}
