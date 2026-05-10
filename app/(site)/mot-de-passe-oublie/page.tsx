import Link from "next/link";
import { AlertCircle, ArrowRight, KeyRound, Lock } from "lucide-react";
import { requestPasswordResetAction } from "@/app/actions";
import { AuthCard, AuthPageShell } from "@/components/raaga/auth-layout";
import {
  Field,
  PageHeader,
  RaCard,
  authInputClass,
  btnPrimaryClass,
} from "@/components/raaga/page-shell";

type MotDePasseOubliePageProps = {
  searchParams: Promise<{ error?: string; envoye?: string }>;
};

export default async function MotDePasseOubliePage({ searchParams }: MotDePasseOubliePageProps) {
  const { error, envoye } = await searchParams;
  const showChampsError = error === "champs";
  const showEnvoye = envoye === "1";

  return (
    <AuthPageShell>
      <div className="container-raaga py-8 sm:py-12 md:py-14">
        <div className="mx-auto flex w-full max-w-[26rem] flex-col items-stretch">
          <PageHeader
            align="center"
            size="auth"
            eyebrow="Compte"
            title="Mot de passe oublié"
            description="Saisissez votre e-mail : nous vous envoyons un lien pour choisir un nouveau mot de passe."
          />

          {showChampsError ? (
            <RaCard
              className="mb-6 w-full rounded-2xl border-rose-200/90 bg-rose-50/75 shadow-sm"
              padding="p-4 sm:p-5"
              role="alert"
            >
              <div className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                  <AlertCircle className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0 text-sm leading-relaxed text-foreground">
                  <p className="font-bold">Champ requis</p>
                  <p className="mt-1 text-muted-foreground">Indiquez votre adresse e-mail pour continuer.</p>
                </div>
              </div>
            </RaCard>
          ) : null}

          {showEnvoye ? (
            <RaCard
              className="mb-6 w-full rounded-2xl border-emerald-200/90 bg-emerald-50/75 shadow-sm"
              padding="p-4 sm:p-5"
              role="status"
            >
              <div className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Lock className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0 text-sm leading-relaxed text-foreground">
                  <p className="font-bold">E-mail envoyé</p>
                  <p className="mt-1 text-muted-foreground">
                    Si un compte existe pour cette adresse, vous recevrez un lien de réinitialisation sous peu. Vérifiez votre
                    boîte de réception et vos courriers indésirables.
                  </p>
                </div>
              </div>
            </RaCard>
          ) : null}

          <AuthCard>
            <div className="mb-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-orange-600 text-white shadow-lg shadow-orange-500/30 ring-4 ring-orange-500/10">
                <KeyRound className="h-7 w-7" strokeWidth={2} aria-hidden />
              </div>
              <p className="mt-5 text-base font-bold text-foreground">Réinitialiser l&apos;accès</p>
              <p className="mt-1.5 text-sm leading-snug text-muted-foreground">
                Le lien reçu par e-mail reste valable pour une durée limitée.
              </p>
            </div>

            <form action={requestPasswordResetAction} className="space-y-5">
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
              <button type="submit" className={`${btnPrimaryClass} group mt-1 min-h-12 w-full gap-2 shadow-orange-500/30`}>
                Envoyer le lien
                <ArrowRight
                  className="h-4 w-4 opacity-90 transition-transform group-hover:translate-x-0.5"
                  strokeWidth={2}
                  aria-hidden
                />
              </button>
            </form>

            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5 shrink-0 text-emerald-600" strokeWidth={2} aria-hidden />
              <span>Traitement sécurisé — aucune information sur l&apos;existence du compte n&apos;est révélée</span>
            </div>
          </AuthCard>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            <Link href="/connexion" className="font-semibold text-brand underline-offset-4 transition hover:underline">
              Retour à la connexion
            </Link>
          </p>
        </div>
      </div>
    </AuthPageShell>
  );
}
