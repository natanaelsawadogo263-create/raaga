"use client";

import Image from "next/image";
import { AlertTriangle, CheckCircle2, Download, Share2, Smartphone, X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

/** Évènement non-standard supporté par Chromium. */
type BeforeInstallPromptEvent = Event & {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt: () => Promise<void>;
};

type Reason =
  | "ready" /** beforeinstallprompt reçu */
  | "ios" /** Safari iOS — installation manuelle uniquement */
  | "firefox" /** Firefox — pas de PWA installable */
  | "insecure" /** Pas de HTTPS et pas de localhost */
  | "browser" /** Navigateur compatible mais l'invite n'a pas (encore) été émise */
  | "unknown";

type Diag = {
  isSecure: boolean;
  isLocalhost: boolean;
  hasSW: boolean;
  uaName: string;
};

function detectDiag(): Diag {
  if (typeof window === "undefined") {
    return { isSecure: false, isLocalhost: false, hasSW: false, uaName: "" };
  }
  const host = window.location.hostname;
  const isLocalhost = host === "localhost" || host === "127.0.0.1" || host === "::1";
  return {
    isSecure: window.isSecureContext,
    isLocalhost,
    hasSW: "serviceWorker" in navigator,
    uaName: navigator.userAgent,
  };
}

function detectReason(deferred: BeforeInstallPromptEvent | null, diag: Diag): Reason {
  if (deferred) return "ready";
  const ua = diag.uaName;
  const isIos = /iPad|iPhone|iPod/.test(ua);
  if (isIos) return "ios";
  const isFirefox = /Firefox\//.test(ua) && !/Seamonkey/.test(ua);
  if (isFirefox) return "firefox";
  if (!diag.isSecure && !diag.isLocalhost) return "insecure";
  return "browser";
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const mq = window.matchMedia?.("(display-mode: standalone)").matches ?? false;
  const ios = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  return mq || ios;
}

type Props = {
  className?: string;
  children?: ReactNode;
};

export function InstallPwaButton({ className, children }: Props) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [open, setOpen] = useState(false);
  const [diag, setDiag] = useState<Diag>({ isSecure: false, isLocalhost: false, hasSW: false, uaName: "" });
  const [swState, setSwState] = useState<"idle" | "registering" | "ready" | "error">("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDiag(detectDiag());

    if (isStandalone()) {
      setInstalled(true);
      return;
    }

    if ("serviceWorker" in navigator) {
      setSwState("registering");
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => setSwState("ready"))
        .catch(() => setSwState("error"));
    }

    function onBefore(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setDeferred(null);
      setInstalled(true);
      setOpen(false);
    }

    window.addEventListener("beforeinstallprompt", onBefore);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBefore);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function handleClick() {
    if (deferred) {
      try {
        await deferred.prompt();
        const choice = await deferred.userChoice;
        if (choice.outcome === "accepted") {
          setInstalled(true);
        }
        setDeferred(null);
        return;
      } catch {
        /** Fallback : guide d'installation manuel. */
      }
    }
    setOpen(true);
  }

  if (installed) return null;

  const reason = detectReason(deferred, diag);

  return (
    <>
      <button type="button" onClick={handleClick} className={className} aria-haspopup="dialog">
        {children ?? (
          <>
            <Download className="mr-2 inline h-4 w-4" aria-hidden />
            Télécharger l&apos;application
          </>
        )}
      </button>

      {open ? <InstallDialog reason={reason} swState={swState} diag={diag} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function InstallDialog({
  reason,
  swState,
  diag,
  onClose,
}: {
  reason: Reason;
  swState: "idle" | "registering" | "ready" | "error";
  diag: Diag;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-pwa-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-br from-orange-50 to-white px-5 py-4">
          <div className="relative h-12 w-12 overflow-hidden rounded-2xl ring-2 ring-orange-200">
            <Image src="/icons/icon-192.png" alt="" fill sizes="48px" className="object-cover" />
          </div>
          <div className="min-w-0">
            <p id="install-pwa-title" className="text-sm font-black text-slate-900">
              Installer Raaga
            </p>
            <p className="text-[12px] text-slate-600">
              Ajoutez l&apos;application à votre écran d&apos;accueil en quelques secondes.
            </p>
          </div>
        </div>

        <div className="px-5 py-4 text-[13px] leading-relaxed text-slate-700">
          {reason === "ios" ? <IosInstructions /> : null}
          {reason === "firefox" ? <FirefoxNotice /> : null}
          {reason === "insecure" ? <InsecureNotice /> : null}
          {reason === "browser" ? <ChromeManualInstructions /> : null}
          {reason === "ready" ? (
            <p className="flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              Cliquez à nouveau sur « Télécharger l&apos;application » : votre navigateur va afficher la fenêtre
              système d&apos;installation.
            </p>
          ) : null}

          <DiagBlock swState={swState} diag={diag} />
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-xl bg-brand px-4 py-2 text-sm font-bold text-brand-contrast shadow-sm transition hover:brightness-105"
          >
            J&apos;ai compris
          </button>
        </div>
      </div>
    </div>
  );
}

function IosInstructions() {
  return (
    <>
      <p className="flex items-center gap-2 font-bold text-slate-900">
        <Share2 className="h-4 w-4 text-brand" aria-hidden />
        iPhone / iPad — Safari
      </p>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5">
        <li>Ouvrez ce site dans <strong>Safari</strong> (pas Chrome iOS).</li>
        <li>
          Touchez l&apos;icône <strong>Partager</strong> (carré + flèche) en bas de l&apos;écran.
        </li>
        <li>
          Choisissez <strong>« Sur l&apos;écran d&apos;accueil »</strong>, puis <strong>Ajouter</strong>.
        </li>
      </ol>
    </>
  );
}

function ChromeManualInstructions() {
  return (
    <>
      <p className="flex items-center gap-2 font-bold text-slate-900">
        <Smartphone className="h-4 w-4 text-brand" aria-hidden />
        Installation manuelle (Chrome / Edge / Samsung Internet)
      </p>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5">
        <li>
          Sur ordinateur : icône <strong>Installer</strong> à droite de la barre d&apos;adresse, ou menu{" "}
          <strong>⋮</strong> → <strong>Installer Raaga…</strong>
        </li>
        <li>
          Sur Android : menu <strong>⋮</strong> du navigateur →{" "}
          <strong>Installer l&apos;application</strong> ou <strong>Ajouter à l&apos;écran d&apos;accueil</strong>.
        </li>
      </ol>
      <p className="mt-3 text-[12px] text-slate-500">
        L&apos;invite automatique n&apos;est proposée qu&apos;après quelques secondes de navigation, et seulement quand
        Chrome estime le site éligible. Le manuel reste possible à tout moment.
      </p>
    </>
  );
}

function FirefoxNotice() {
  return (
    <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-amber-900">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span>
        <strong>Firefox</strong> ne propose pas l&apos;installation des PWA sur la plupart des plateformes. Ouvrez Raaga
        dans <strong>Chrome</strong>, <strong>Edge</strong> ou <strong>Samsung Internet</strong> pour l&apos;installer.
      </span>
    </p>
  );
}

function InsecureNotice() {
  return (
    <p className="flex items-start gap-2 rounded-xl bg-rose-50 px-3 py-2 text-rose-900">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span>
        Le site doit être servi en <strong>HTTPS</strong> (ou en local sur <code>localhost</code>) pour que les
        navigateurs autorisent l&apos;installation. Ouvrez la version sécurisée du site puis réessayez.
      </span>
    </p>
  );
}

function DiagBlock({
  swState,
  diag,
}: {
  swState: "idle" | "registering" | "ready" | "error";
  diag: Diag;
}) {
  const items: Array<{ label: string; ok: boolean; hint?: string }> = [
    { label: "Connexion sécurisée", ok: diag.isSecure || diag.isLocalhost, hint: diag.isLocalhost ? "localhost" : undefined },
    { label: "Service worker", ok: swState === "ready" },
    { label: "Manifest PWA", ok: true },
  ];
  return (
    <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">État de l&apos;installation</p>
      <ul className="mt-1.5 space-y-1 text-[12px]">
        {items.map((it) => (
          <li key={it.label} className="flex items-center gap-2">
            <span
              className={`inline-block h-2 w-2 rounded-full ${it.ok ? "bg-emerald-500" : "bg-rose-500"}`}
              aria-hidden
            />
            <span className="font-medium text-slate-700">{it.label}</span>
            {it.hint ? <span className="text-slate-400">— {it.hint}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
