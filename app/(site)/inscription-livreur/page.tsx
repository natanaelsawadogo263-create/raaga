import {
  AlertTriangle,
  ArrowRight,
  Bike,
  Camera,
  Clock,
  IdCard,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import { signUpDriverAction } from "@/app/actions";
import { AuthPageShell, AuthSignInLink } from "@/components/raaga/auth-layout";
import { Field, authInputClass, btnPrimaryClass } from "@/components/raaga/page-shell";
import { DriverPhotoUpload } from "@/components/livreur/driver-photo-upload";

type PageProps = {
  searchParams?: Promise<{ error?: string }>;
};

const ERRORS: Record<string, string> = {
  champs: "Tous les champs et toutes les photos sont obligatoires.",
  motdepasse: "Le mot de passe doit dépasser 6 caractères.",
  files: "Photo de profil et carte nationale (recto + verso) sont obligatoires.",
  invalid_image: "Une des photos n'est pas une image valide.",
  too_large: "Une des photos dépasse la limite de 5 Mo.",
  upload: "Impossible d'uploader vos photos. Réessayez dans un instant.",
  email_exists: "Un compte existe déjà avec cette adresse e-mail.",
  signup: "Inscription impossible. Vérifiez vos informations et réessayez.",
};

function StepHeader({
  num,
  Icon,
  title,
  hint,
}: {
  num: number;
  Icon: typeof User;
  title: string;
  hint: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3 border-b border-slate-100 pb-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF7A00] to-orange-600 text-sm font-black text-white shadow-md shadow-orange-500/25">
        {num}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-sm font-black text-slate-900 sm:text-[15px]">
          <Icon className="h-4 w-4 text-[#FF7A00]" strokeWidth={2} aria-hidden />
          {title}
        </p>
        <p className="mt-0.5 text-[12px] leading-snug text-slate-500">{hint}</p>
      </div>
    </div>
  );
}

export default async function InscriptionLivreurPage({ searchParams }: PageProps) {
  const sp = (await searchParams) ?? {};
  const errorMsg = sp.error ? (ERRORS[sp.error] ?? "Une erreur est survenue.") : null;

  return (
    <AuthPageShell>
      <div className="container-raaga py-6 sm:py-10 md:py-12">
        <div className="mx-auto w-full max-w-3xl space-y-5">
          {/* Hero compact */}
          <header className="overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-5 py-6 text-white shadow-xl sm:px-7 sm:py-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur ring-1 ring-white/20">
                  <Bike className="h-6 w-6" strokeWidth={2} aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-white/60">
                    Livreur partenaire
                  </p>
                  <h1 className="mt-0.5 text-xl font-black leading-tight text-white sm:text-2xl">
                    Inscription livreur Raaga
                  </h1>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-bold text-emerald-300 ring-1 ring-emerald-400/30">
                  <ShieldCheck className="h-3 w-3" aria-hidden />
                  Dossier sécurisé
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-[11px] font-bold text-amber-200 ring-1 ring-amber-400/30">
                  <Clock className="h-3 w-3" aria-hidden />
                  Validation sous 48 h
                </span>
              </div>
            </div>

            {/* Stepper visuel */}
            <ol className="mt-5 grid grid-cols-3 gap-2 text-[11px] font-bold">
              {[
                { n: 1, label: "Identité" },
                { n: 2, label: "Adresse" },
                { n: 3, label: "Pièces" },
              ].map((s) => (
                <li
                  key={s.n}
                  className="flex items-center gap-2 rounded-xl bg-white/5 px-2.5 py-2 ring-1 ring-white/10"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-black text-slate-900">
                    {s.n}
                  </span>
                  <span className="truncate text-white">{s.label}</span>
                </li>
              ))}
            </ol>
          </header>

          {/* Bandeau d'erreur */}
          {errorMsg ? (
            <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800 shadow-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>{errorMsg}</span>
            </div>
          ) : null}

          <form action={signUpDriverAction} className="space-y-5">
            {/* Étape 1 — Identité & connexion */}
            <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
              <StepHeader
                num={1}
                Icon={User}
                title="Identité & accès"
                hint="Vos noms, e-mail, téléphone et un mot de passe pour vous connecter."
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Prénom" htmlFor="liv_first_name">
                  <input
                    id="liv_first_name"
                    name="first_name"
                    required
                    autoComplete="given-name"
                    placeholder="Prénom"
                    className={authInputClass}
                  />
                </Field>
                <Field label="Nom" htmlFor="liv_last_name">
                  <input
                    id="liv_last_name"
                    name="last_name"
                    required
                    autoComplete="family-name"
                    placeholder="Nom"
                    className={authInputClass}
                  />
                </Field>

                <Field label="E-mail" htmlFor="liv_email">
                  <div className="relative">
                    <Mail
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                      strokeWidth={2}
                      aria-hidden
                    />
                    <input
                      id="liv_email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="vous@exemple.com"
                      className={`${authInputClass} pl-10`}
                    />
                  </div>
                </Field>
                <Field label="Téléphone" htmlFor="liv_phone">
                  <div className="relative">
                    <Phone
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                      strokeWidth={2}
                      aria-hidden
                    />
                    <input
                      id="liv_phone"
                      name="phone"
                      required
                      autoComplete="tel"
                      placeholder="+226 …"
                      className={`${authInputClass} pl-10`}
                    />
                  </div>
                </Field>

                <Field label="Mot de passe" htmlFor="liv_password" className="sm:col-span-2">
                  <div className="relative">
                    <Lock
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                      strokeWidth={2}
                      aria-hidden
                    />
                    <input
                      id="liv_password"
                      name="password"
                      type="password"
                      required
                      autoComplete="new-password"
                      placeholder="Plus de 6 caractères"
                      minLength={7}
                      className={`${authInputClass} pl-10`}
                    />
                  </div>
                </Field>
              </div>
            </section>

            {/* Étape 2 — Zone d'opération */}
            <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
              <StepHeader
                num={2}
                Icon={MapPin}
                title="Zone d'opération"
                hint="L'adresse à partir de laquelle vous comptez livrer."
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Ville" htmlFor="liv_city">
                  <input
                    id="liv_city"
                    name="city"
                    required
                    placeholder="Ouagadougou"
                    className={authInputClass}
                  />
                </Field>
                <Field label="Quartier" htmlFor="liv_district">
                  <input
                    id="liv_district"
                    name="district"
                    required
                    placeholder="Patte d'oie, Cissin…"
                    className={authInputClass}
                  />
                </Field>
              </div>
            </section>

            {/* Étape 3 — Pièces justificatives */}
            <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
              <StepHeader
                num={3}
                Icon={IdCard}
                title="Pièces justificatives"
                hint="Photo de profil + Carte Nationale d'Identité Burkinabè (recto et verso). Les 3 sont obligatoires."
              />

              <div className="grid gap-5 lg:grid-cols-[260px_1fr] lg:items-start">
                {/* Bloc avatar */}
                <div className="rounded-2xl border border-orange-200/70 bg-gradient-to-br from-orange-50/80 via-white to-white p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#FF7A00] text-white shadow-sm">
                      <Camera className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                    </span>
                    <p className="text-[11px] font-black uppercase tracking-wide text-[#FF7A00]">
                      Photo de profil
                    </p>
                  </div>
                  <DriverPhotoUpload
                    id="liv_avatar"
                    name="avatar"
                    label="Votre visage"
                    variant="avatar"
                    hint="Visible par les clients à chaque livraison. Visage net, fond uni."
                  />
                </div>

                {/* Bloc CNIB */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/40 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 text-white shadow-sm">
                      <IdCard className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                    </span>
                    <p className="text-[11px] font-black uppercase tracking-wide text-slate-700">
                      Carte Nationale d&apos;Identité Burkinabè
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <DriverPhotoUpload
                      id="liv_cni_front"
                      name="cni_front"
                      label="Recto"
                      variant="id-front"
                      hint="Face avec votre photo et votre nom."
                    />
                    <DriverPhotoUpload
                      id="liv_cni_back"
                      name="cni_back"
                      label="Verso"
                      variant="id-back"
                      hint="Face avec les informations administratives."
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Footer / CTA */}
            <section className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-orange-50/30 to-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col items-center gap-3">
                <button
                  type="submit"
                  className={`${btnPrimaryClass} group min-h-12 w-full gap-2 sm:max-w-md`}
                >
                  Soumettre mon dossier
                  <ArrowRight
                    className="h-4 w-4 opacity-90 transition-transform group-hover:translate-x-0.5"
                    strokeWidth={2}
                    aria-hidden
                  />
                </button>
                <p className="max-w-md text-center text-[11px] leading-relaxed text-muted-foreground">
                  En soumettant, vous acceptez la vérification manuelle de votre dossier par
                  l&apos;équipe Raaga avant l&apos;activation de votre compte. Vos pièces
                  d&apos;identité restent confidentielles.
                </p>
                <AuthSignInLink />
              </div>
            </section>
          </form>
        </div>
      </div>
    </AuthPageShell>
  );
}
