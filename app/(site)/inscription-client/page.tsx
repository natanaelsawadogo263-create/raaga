import { ArrowRight, UserPlus } from "lucide-react";
import { signUpCustomerAction } from "@/app/actions";
import { AuthCard, AuthPageShell, AuthSignInLink } from "@/components/raaga/auth-layout";
import {
  Field,
  PageHeader,
  authInputClass,
  btnPrimaryClass,
} from "@/components/raaga/page-shell";

export default function InscriptionClientPage() {
  return (
    <AuthPageShell>
      <div className="container-raaga py-8 sm:py-12 md:py-14">
        <div className="mx-auto w-full max-w-2xl">
          <PageHeader
            align="center"
            size="auth"
            eyebrow="Nouveau client"
            title="Inscription client"
            description="Création rapide, sans vérification e-mail obligatoire. Indiquez vos informations de livraison habituelles."
          />

          <AuthCard>
            <div className="mb-8 text-center sm:mb-9">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand/95 to-amber-500 text-white shadow-lg shadow-orange-500/25 ring-4 ring-orange-500/10">
                <UserPlus className="h-7 w-7" strokeWidth={2} aria-hidden />
              </div>
              <p className="mt-5 text-base font-bold text-foreground">Rejoignez Raaga en quelques minutes</p>
              <p className="mt-1.5 text-sm text-muted-foreground">Formulaire court, pensé pour le mobile et la saisie au clavier.</p>
            </div>

            <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Vos coordonnées</p>

            <form action={signUpCustomerAction} className="grid gap-5 sm:grid-cols-2">
              <Field label="Prénom" htmlFor="first_name">
                <input id="first_name" name="first_name" required autoComplete="given-name" placeholder="Awa" className={authInputClass} />
              </Field>
              <Field label="Nom" htmlFor="last_name">
                <input id="last_name" name="last_name" required autoComplete="family-name" placeholder="Kaboré" className={authInputClass} />
              </Field>
              <Field label="E-mail" htmlFor="email">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="vous@exemple.com"
                  className={authInputClass}
                />
              </Field>
              <Field label="Téléphone" htmlFor="phone">
                <input id="phone" name="phone" required autoComplete="tel" placeholder="+226 …" className={authInputClass} />
              </Field>
              <Field label="Ville" htmlFor="city">
                <input id="city" name="city" required autoComplete="address-level2" placeholder="Ouagadougou" className={authInputClass} />
              </Field>
              <Field label="Quartier" htmlFor="district">
                <input id="district" name="district" required placeholder="Zone du bois" className={authInputClass} />
              </Field>
              <Field
                label="Mot de passe"
                htmlFor="password"
                hint="Minimum recommandé : 8 caractères."
                className="sm:col-span-2"
              >
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={authInputClass}
                />
              </Field>
              <div className="flex flex-col gap-3 sm:col-span-2">
                <button type="submit" className={`${btnPrimaryClass} group min-h-12 w-full gap-2 sm:mx-auto sm:w-full sm:max-w-md`}>
                  Créer mon compte
                  <ArrowRight className="h-4 w-4 opacity-90 transition-transform group-hover:translate-x-0.5" strokeWidth={2} aria-hidden />
                </button>
                <AuthSignInLink />
              </div>
            </form>
          </AuthCard>
        </div>
      </div>
    </AuthPageShell>
  );
}
