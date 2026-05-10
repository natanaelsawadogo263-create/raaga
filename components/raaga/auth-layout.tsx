import type { ReactNode } from "react";
import Link from "next/link";
import { btnSecondaryClass } from "@/components/raaga/page-shell";

export function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-[calc(100dvh-5.5rem)]">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_72%_48%_at_50%_-18%,rgba(249,115,22,0.17),transparent_56%)]" />
        <div className="absolute right-[max(-8rem,calc(50%-28rem))] top-8 h-72 w-72 rounded-full bg-amber-400/15 blur-3xl md:top-16 md:h-[22rem] md:w-[22rem]" />
        <div className="absolute bottom-8 left-[max(-6rem,calc(50%-24rem))] h-56 w-56 rounded-full bg-orange-500/12 blur-3xl md:bottom-16" />
      </div>
      {children}
    </div>
  );
}

export function AuthCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-3xl border border-border/65 bg-card/92 p-6 shadow-[0_22px_44px_-18px_rgba(15,23,42,0.14),inset_0_1px_0_0_rgba(255,255,255,0.65)] ring-1 ring-black/[0.04] backdrop-blur-md sm:p-8 ${className}`}
    >
      {children}
    </div>
  );
}

export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="relative my-7 flex items-center gap-4" role="presentation">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-border/80" />
      <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{label}</span>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-border/80" />
    </div>
  );
}

type AuthAltAction = { href: string; label: string };

export function AuthAlternateAccounts({ primary, secondary }: { primary: AuthAltAction; secondary: AuthAltAction }) {
  return (
    <div className="mt-2 space-y-4">
      <p className="text-center text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
        Pas encore de compte ?
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-3">
        <Link
          href={primary.href}
          className={`${btnSecondaryClass} min-h-12 w-full justify-center border-border/90 bg-card/80 px-6 shadow-sm hover:bg-orange-50/60 sm:min-w-[11rem] sm:flex-1 sm:max-w-[14rem]`}
        >
          {primary.label}
        </Link>
        <Link
          href={secondary.href}
          className={`${btnSecondaryClass} min-h-12 w-full justify-center border-border/90 bg-card/80 px-6 shadow-sm hover:bg-orange-50/60 sm:min-w-[11rem] sm:flex-1 sm:max-w-[14rem]`}
        >
          {secondary.label}
        </Link>
      </div>
    </div>
  );
}

export function AuthSignInLink() {
  return (
    <p className="mt-8 text-center text-sm text-muted-foreground">
      Déjà un compte ?{" "}
      <Link href="/connexion" className="font-semibold text-brand underline-offset-4 transition hover:underline">
        Se connecter
      </Link>
    </p>
  );
}
