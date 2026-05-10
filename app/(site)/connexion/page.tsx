import Link from "next/link";
import { AlertCircle, ArrowRight, LogIn, Lock } from "lucide-react";
import { signInAction } from "@/app/actions";
import {
  AuthAlternateAccounts,
  AuthCard,
  AuthDivider,
  AuthPageShell,
} from "@/components/raaga/auth-layout";
import {
  Field,
  PageHeader,
  RaCard,
  authInputClass,
  btnPrimaryClass,
} from "@/components/raaga/page-shell";

type ConnexionPageProps = {
  searchParams: Promise<{ configuration?: string; error?: string; motdepasse?: string; next?: string }>;
};

function safeInternalNext(raw: string | undefined): string {
  if (typeof raw !== "string") {
    return "";
  }
  const t = raw.trim();
  if (!t.startsWith("/") || t.startsWith("//") || t.includes("://")) {
    return "";
  }
  return t;
}

export default async function ConnexionPage({ searchParams }: ConnexionPageProps) {
  const { configuration, error, motdepasse, next: nextRaw } = await searchParams;
  const next = safeInternalNext(nextRaw);
  const showSupabaseConfig = configuration === "supabase";
  const showInvalidCredentials = error === "invalid_credentials";
  const showGenericAuthError = error === "auth";
  const showPasswordResetSuccess = motdepasse === "reinitialise";

  return (
    <AuthPageShell>
      <div className="container-raaga py-8 sm:py-12 md:py-14">
        <div className="mx-auto flex w-full max-w-[26rem] flex-col items-stretch">
          <PageHeader
            align="center"
            size="auth"
            eyebrow="Compte"
            title="Connexion"
          />

          {showSupabaseConfig ? (
            <RaCard
              className="mb-6 w-full rounded-2xl border-orange-200/90 bg-orange-50/60 shadow-sm"
              padding="p-4 sm:p-5"
              role="alert"
            >
              <div className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-brand">
                  <AlertCircle className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0 text-sm leading-relaxed text-foreground">
                  <p className="font-bold">Authentification non disponible</p>
                  <p className="mt-1 text-muted-foreground">
                    Définissez{" "}
                    <code className="rounded-md bg-white/90 px-1.5 py-0.5 text-xs font-mono shadow-sm">
                      NEXT_PUBLIC_SUPABASE_URL
                    </code>{" "}
                    et{" "}
                    <code className="rounded-md bg-white/90 px-1.5 py-0.5 text-xs font-mono shadow-sm">
                      NEXT_PUBLIC_SUPABASE_ANON_KEY
                    </code>{" "}
                    dans votre fichier{" "}
                    <code className="rounded-md bg-white/90 px-1.5 py-0.5 text-xs font-mono shadow-sm">.env.local</code>{" "}
                    (voir <span className="font-mono text-xs">.env.example</span>), puis redémarrez le serveur de développement.
                  </p>
                </div>
              </div>
            </RaCard>
          ) : null}
          {showInvalidCredentials ? (
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
                  <p className="font-bold">Identifiants invalides</p>
                  <p className="mt-1 text-muted-foreground">Vérifiez votre e-mail et votre mot de passe, puis réessayez.</p>
                </div>
              </div>
            </RaCard>
          ) : null}
          {showGenericAuthError ? (
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
                  <p className="font-bold">Connexion impossible</p>
                  <p className="mt-1 text-muted-foreground">Une erreur est survenue. Réessayez dans quelques instants.</p>
                </div>
              </div>
            </RaCard>
          ) : null}
          {showPasswordResetSuccess ? (
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
                  <p className="font-bold">Mot de passe réinitialisé</p>
                  <p className="mt-1 text-muted-foreground">
                    Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
                  </p>
                </div>
              </div>
            </RaCard>
          ) : null}

          <AuthCard>
            <div className="mb-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-orange-600 text-white shadow-lg shadow-orange-500/30 ring-4 ring-orange-500/10">
                <LogIn className="h-7 w-7" strokeWidth={2} aria-hidden />
              </div>
              <p className="mt-5 text-base font-bold text-foreground">Heureux de vous revoir</p>
            </div>

            <form action={signInAction} className="space-y-5">
              {next ? <input type="hidden" name="next" value={next} /> : null}
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
              <Field label="Mot de passe" htmlFor="password">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={authInputClass}
                />
              </Field>
              <div className="-mt-1 flex justify-end">
                <Link
                  href="/mot-de-passe-oublie"
                  className="text-sm font-semibold text-brand underline-offset-4 transition hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <button type="submit" className={`${btnPrimaryClass} group mt-1 min-h-12 w-full gap-2 shadow-orange-500/30`}>
                Se connecter
                <ArrowRight
                  className="h-4 w-4 opacity-90 transition-transform group-hover:translate-x-0.5"
                  strokeWidth={2}
                  aria-hidden
                />
              </button>
            </form>

            <AuthDivider label="ou" />

            <AuthAlternateAccounts
              primary={{ href: "/inscription-client", label: "Créer un compte client" }}
              secondary={{ href: "/inscription-livreur", label: "Devenir livreur" }}
            />
          </AuthCard>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Besoin d&apos;aide ?{" "}
            <Link href="/aide" className="font-semibold text-brand underline-offset-4 hover:underline">
              Centre d&apos;aide
            </Link>
          </p>
        </div>
      </div>
    </AuthPageShell>
  );
}
