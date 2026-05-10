import { HelpCircle } from "lucide-react";
import { faqItems } from "@/lib/raaga-data";
import { PageHeader, PageShell } from "@/components/raaga/page-shell";

export default function FaqPage() {
  return (
    <PageShell>
      <div className="container-raaga py-6 sm:py-10">
        <PageHeader
          eyebrow="FAQ"
          title="Questions frequentes"
          description="Compte, commande, livraison, paiements locaux et application mobile : les reponses essentielles avant de contacter le support."
        />

        <div className="space-y-3">
          {faqItems.map((item) => (
            <details
              key={item.question}
              className="group rounded-2xl border border-border/80 bg-card shadow-sm ring-1 ring-black/[0.04] open:shadow-md open:ring-brand/15"
            >
              <summary className="flex cursor-pointer list-none items-start gap-3 p-5 pr-4 text-left [&::-webkit-details-marker]:hidden">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-brand ring-1 ring-orange-100">
                  <HelpCircle className="h-5 w-5" aria-hidden />
                </span>
                <span className="flex-1 pt-0.5">
                  <span className="block text-sm font-bold text-foreground group-open:text-brand">{item.question}</span>
                </span>
                <span className="text-muted-foreground transition group-open:rotate-180">▼</span>
              </summary>
              <div className="border-t border-border px-5 pb-5 pl-[4.25rem]">
                <p className="text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
