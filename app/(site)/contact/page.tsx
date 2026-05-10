import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import {
  Field,
  PageHeader,
  PageShell,
  RaCard,
  btnPrimaryClass,
  inputClass,
  textareaClass,
} from "@/components/raaga/page-shell";

export default function ContactPage() {
  return (
    <PageShell>
      <div className="container-raaga py-6 sm:py-10">
        <PageHeader
          eyebrow="Equipe Raaga"
          title="Contact"
          description="Une question sur une commande, un partenariat boutique ou le recrutement livreur ? Nous repondons vite sur les canaux locaux."
        />

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <RaCard className="flex gap-4" padding="p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-brand ring-1 ring-orange-100">
                <Phone className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Telephone</p>
                <p className="mt-1 text-lg font-bold text-foreground">+226 57537299</p>
              </div>
            </RaCard>
            <RaCard className="flex gap-4" padding="p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-brand ring-1 ring-orange-100">
                <Mail className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Email</p>
                <p className="mt-1 text-lg font-bold text-foreground">contactraagabf@gmail.com</p>
              </div>
            </RaCard>
            <RaCard className="flex gap-4" padding="p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-brand ring-1 ring-orange-100">
                <MessageCircle className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">WhatsApp</p>
                <p className="mt-1 text-lg font-bold text-foreground">+226 57537299</p>
              </div>
            </RaCard>
            <RaCard className="flex gap-4" padding="p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-brand ring-1 ring-orange-100">
                <MapPin className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Bureau</p>
                <p className="mt-1 text-sm font-semibold text-foreground">Ouagadougou, Burkina Faso</p>
              </div>
            </RaCard>
          </div>

          <RaCard padding="p-6 sm:p-8">
            <p className="text-base font-bold text-foreground">Envoyer un message</p>
            <div className="mt-6 space-y-4">
              <Field label="Nom" htmlFor="c-name">
                <input id="c-name" name="name" className={inputClass} placeholder="Votre nom" disabled readOnly />
              </Field>
              <Field label="Message" htmlFor="c-msg">
                <textarea id="c-msg" name="message" className={textareaClass} placeholder="Votre message..." disabled readOnly rows={4} />
              </Field>
              <button type="button" disabled className={`${btnPrimaryClass} w-full cursor-not-allowed opacity-60`}>
                Envoyer (bientot)
              </button>
            </div>
          </RaCard>
        </div>
      </div>
    </PageShell>
  );
}
