"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowRight, KeyRound, Loader2, Lock } from "lucide-react";
import { AuthCard, AuthPageShell } from "@/components/raaga/auth-layout";
import { Field, PageHeader, RaCard, authInputClass, btnPrimaryClass } from "@/components/raaga/page-shell";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const RECOVERY_TIMEOUT_MS = 5000;

type Phase = "loading" | "ready" | "invalid";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const resolvedRef = useRef(false);
  const recoveryTimerRef = useRef<number | null>(null);

  const markReady = useCallback(() => {
    if (resolvedRef.current) {
      return;
    }
    resolvedRef.current = true;
    if (recoveryTimerRef.current) {
      window.clearTimeout(recoveryTimerRef.current);
      recoveryTimerRef.current = null;
    }
    setPhase("ready");
  }, []);

  const markInvalid = useCallback(() => {
    if (resolvedRef.current) {
      return;
    }
    resolvedRef.current = true;
    if (recoveryTimerRef.current) {
      window.clearTimeout(recoveryTimerRef.current);
      recoveryTimerRef.current = null;
    }
    setPhase("invalid");
  }, []);

  useEffect(() => {
    let cancelled = false;
    let supabase: ReturnType<typeof getSupabaseBrowserClient>;
    try {
      supabase = getSupabaseBrowserClient();
    } catch {
      markInvalid();
      return;
    }

    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) {
        return;
      }
      if (session) {
        markReady();
      }
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled || resolvedRef.current) {
        return;
      }
      if (event === "PASSWORD_RECOVERY" && session) {
        markReady();
      }
    });

    recoveryTimerRef.current = window.setTimeout(() => {
      recoveryTimerRef.current = null;
      if (cancelled || resolvedRef.current) {
        return;
      }
      void (async () => {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (cancelled || resolvedRef.current) {
          return;
        }
        if (session) {
          markReady();
        } else {
          markInvalid();
        }
      })();
    }, RECOVERY_TIMEOUT_MS);

    return () => {
      cancelled = true;
      if (recoveryTimerRef.current) {
        window.clearTimeout(recoveryTimerRef.current);
        recoveryTimerRef.current = null;
      }
      subscription.unsubscribe();
    };
  }, [markInvalid, markReady]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (password.length < 8) {
      setFormError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirm) {
      setFormError("Les mots de passe ne correspondent pas.");
      return;
    }

    let supabase: ReturnType<typeof getSupabaseBrowserClient>;
    try {
      supabase = getSupabaseBrowserClient();
    } catch {
      setFormError("Configuration Supabase manquante.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (error) {
      setFormError(error.message);
      return;
    }

    await supabase.auth.signOut();
    router.push("/connexion?motdepasse=reinitialise");
  }

  if (phase === "loading") {
    return (
      <AuthPageShell>
        <div className="container-raaga py-8 sm:py-12 md:py-14">
          <div className="mx-auto flex w-full max-w-[26rem] flex-col items-center justify-center gap-3 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand" aria-hidden />
            <p className="text-sm text-muted-foreground">Vérification du lien de réinitialisation…</p>
          </div>
        </div>
      </AuthPageShell>
    );
  }

  if (phase === "invalid") {
    return (
      <AuthPageShell>
        <div className="container-raaga py-8 sm:py-12 md:py-14">
          <div className="mx-auto flex w-full max-w-[26rem] flex-col items-stretch">
            <PageHeader
              align="center"
              size="auth"
              eyebrow="Compte"
              title="Lien invalide ou expiré"
              description="Ce lien de réinitialisation n’est plus utilisable. Demandez un nouveau lien depuis la page mot de passe oublié."
            />
            <RaCard
              className="mb-6 w-full rounded-2xl border-amber-200/90 bg-amber-50/75 shadow-sm"
              padding="p-4 sm:p-5"
              role="alert"
            >
              <div className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                  <AlertCircle className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0 text-sm leading-relaxed text-foreground">
                  <p className="font-bold">Réessayez depuis un nouvel e-mail</p>
                  <p className="mt-1 text-muted-foreground">
                    Les liens expirent pour protéger votre compte. Vous pouvez en demander un autre ci-dessous.
                  </p>
                </div>
              </div>
            </RaCard>
            <p className="text-center text-sm">
              <Link href="/mot-de-passe-oublie" className="font-semibold text-brand underline-offset-4 hover:underline">
                Demander un nouveau lien
              </Link>
              {" · "}
              <Link href="/connexion" className="font-semibold text-foreground underline-offset-4 hover:underline">
                Connexion
              </Link>
            </p>
          </div>
        </div>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell>
      <div className="container-raaga py-8 sm:py-12 md:py-14">
        <div className="mx-auto flex w-full max-w-[26rem] flex-col items-stretch">
          <PageHeader
            align="center"
            size="auth"
            eyebrow="Compte"
            title="Nouveau mot de passe"
            description="Choisissez un mot de passe sécurisé pour finaliser la réinitialisation."
          />

          {formError ? (
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
                  <p className="font-bold">Impossible d’enregistrer</p>
                  <p className="mt-1 text-muted-foreground">{formError}</p>
                </div>
              </div>
            </RaCard>
          ) : null}

          <AuthCard>
            <div className="mb-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-orange-600 text-white shadow-lg shadow-orange-500/30 ring-4 ring-orange-500/10">
                <KeyRound className="h-7 w-7" strokeWidth={2} aria-hidden />
              </div>
              <p className="mt-5 text-base font-bold text-foreground">Définissez votre mot de passe</p>
              <p className="mt-1.5 text-sm leading-snug text-muted-foreground">Au moins 8 caractères.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Field label="Nouveau mot de passe" htmlFor="new_password">
                <input
                  id="new_password"
                  name="new_password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={authInputClass}
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                  disabled={submitting}
                />
              </Field>
              <Field label="Confirmer le mot de passe" htmlFor="confirm_password">
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={authInputClass}
                  value={confirm}
                  onChange={(ev) => setConfirm(ev.target.value)}
                  disabled={submitting}
                />
              </Field>
              <button
                type="submit"
                disabled={submitting}
                className={`${btnPrimaryClass} group mt-1 min-h-12 w-full gap-2 shadow-orange-500/30 disabled:pointer-events-none disabled:opacity-60`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Enregistrement…
                  </>
                ) : (
                  <>
                    Enregistrer
                    <ArrowRight
                      className="h-4 w-4 opacity-90 transition-transform group-hover:translate-x-0.5"
                      strokeWidth={2}
                      aria-hidden
                    />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5 shrink-0 text-emerald-600" strokeWidth={2} aria-hidden />
              <span>Mise à jour sécurisée via Supabase</span>
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
