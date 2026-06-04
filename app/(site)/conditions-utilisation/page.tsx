import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";

const UPDATED_AT = "2026-05-19";

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
  description:
    "Conditions générales d'utilisation de la plateforme Raaga : comptes, commandes, livraisons et responsabilités.",
};

export default function ConditionsUtilisationPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title="Conditions d'utilisation"
      description="Les présentes conditions encadrent l'accès et l'utilisation de Raaga par les clients, livreurs et visiteurs de la plateforme."
      updatedAt={UPDATED_AT}
      sections={[
        {
          id: "objet",
          title: "1. Objet",
          content: (
            <>
              <p>
                Raaga est une plateforme e-commerce et de livraison locale opérée au Burkina Faso. Elle met en relation
                des clients, des boutiques partenaires et des livreurs indépendants pour la vente, la préparation et la
                remise de produits commandés en ligne.
              </p>
              <p>
                En créant un compte ou en utilisant le site, vous acceptez sans réserve les présentes conditions
                d&apos;utilisation.
              </p>
            </>
          ),
        },
        {
          id: "comptes",
          title: "2. Comptes utilisateurs",
          content: (
            <>
              <p>
                Vous vous engagez à fournir des informations exactes lors de l&apos;inscription et à maintenir la
                confidentialité de vos identifiants. Toute activité réalisée depuis votre compte est réputée effectuée
                par vous.
              </p>
              <p>
                Raaga se réserve le droit de suspendre ou supprimer un compte en cas de fraude, d&apos;usage abusif, de
                fausses déclarations ou de non-respect des présentes conditions.
              </p>
            </>
          ),
        },
        {
          id: "commandes",
          title: "3. Commandes et paiements",
          content: (
            <>
              <p>
                Une commande est confirmée lorsque vous validez le panier et que Raaga enregistre la demande. Les prix
                affichés sont en francs CFA (FCFA). Les frais de livraison, le cas échéant, sont indiqués avant
                validation.
              </p>
              <p>
                Le paiement à la livraison peut être proposé selon les modalités affichées au moment de la commande.
                Vous vous engagez à être disponible à l&apos;adresse indiquée ou à organiser la récupération conformément
                aux instructions reçues (notamment pour les produits nécessitant une livraison spéciale).
              </p>
            </>
          ),
        },
        {
          id: "livraison",
          title: "4. Livraison et réception",
          content: (
            <>
              <p>
                Les délais de livraison sont indicatifs. Un code secret ou une confirmation peut être demandé(e) pour
                attester la remise du colis. En cas de litige sur la réception, contactez le support Raaga dans les
                meilleurs délais via la page Contact ou l&apos;espace d&apos;aide.
              </p>
              <p>
                Les livreurs et boutiques partenaires interviennent sous la coordination de Raaga ; ils demeurent
                responsables de leurs actes dans le cadre de leur mission.
              </p>
            </>
          ),
        },
        {
          id: "contenu",
          title: "5. Contenu et propriété intellectuelle",
          content: (
            <>
              <p>
                Les textes, visuels, marques et éléments graphiques de Raaga sont protégés. Toute reproduction non
                autorisée est interdite. Les contenus publiés par les boutiques (descriptions, images produits) restent
                sous la responsabilité de leurs auteurs.
              </p>
            </>
          ),
        },
        {
          id: "responsabilite",
          title: "6. Limitation de responsabilité",
          content: (
            <>
              <p>
                Raaga s&apos;efforce d&apos;assurer la disponibilité et la fiabilité du service, sans garantie
                d&apos;accès ininterrompu. Raaga ne saurait être tenue responsable des dommages indirects liés à
                l&apos;utilisation de la plateforme, dans les limites autorisées par la loi applicable au Burkina Faso.
              </p>
            </>
          ),
        },
        {
          id: "modifications",
          title: "7. Modifications et contact",
          content: (
            <>
              <p>
                Raaga peut mettre à jour les présentes conditions. La date de dernière mise à jour figure en tête de
                page. En cas de question :{" "}
                <a href="mailto:contactraagabf@gmail.com" className="font-semibold text-brand hover:underline">
                  contactraagabf@gmail.com
                </a>
                .
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
