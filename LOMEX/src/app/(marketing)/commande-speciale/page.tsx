import type { Metadata } from "next";
import { Globe2, ShieldCheck, Sparkles, Timer } from "lucide-react";
import { SpecialRequestForm } from "@/components/marketing/special-request-form";

export const metadata: Metadata = {
  title: "Commande spéciale",
  description:
    "Vous avez vu un produit sur Alibaba, Amazon ou Shein ? LomExpress l'importe pour vous.",
};

const benefits = [
  { icon: Sparkles, label: "Devis sous 24h" },
  { icon: Globe2, label: "Tous les sites supportés" },
  { icon: Timer, label: "Délais transparents" },
  { icon: ShieldCheck, label: "Achat & dédouanement gérés" },
];

export default function SpecialOrderPage() {
  return (
    <div className="container-page py-12">
      <div className="grid gap-10 lg:grid-cols-[1fr_460px]">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Globe2 className="h-3.5 w-3.5 text-accent" /> Commande spéciale
          </span>
          <h1 className="font-display text-3xl font-bold leading-tight md:text-5xl">
            Importez n&apos;importe quel produit, <span className="text-primary">livre chez vous</span>.
          </h1>
          <p className="text-muted-foreground">
            Collez le lien de votre produit favori : Alibaba, AliExpress, Amazon, Shein, eBay…
            Notre équipe vérifie la disponibilité, vous propose un devis tout compris (achat,
            transport, dédouanement, livraison) et gère tout pour vous.
          </p>

          <ul className="grid gap-3 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <li
                key={benefit.label}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <benefit.icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium">{benefit.label}</span>
              </li>
            ))}
          </ul>

          <div className="rounded-3xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold">Comment ça marche ?</h2>
            <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>
                <span className="mr-2 font-bold text-foreground">1.</span> Vous remplissez le
                formulaire avec le lien et la quantité.
              </li>
              <li>
                <span className="mr-2 font-bold text-foreground">2.</span> Notre équipe vérifie
                le produit et vous renvoie un devis sous 24h.
              </li>
              <li>
                <span className="mr-2 font-bold text-foreground">3.</span> Vous validez, on
                achète et on importe pour vous.
              </li>
              <li>
                <span className="mr-2 font-bold text-foreground">4.</span> Livraison chez vous
                au Togo dans les délais annoncés.
              </li>
            </ol>
          </div>
        </div>

        <div className="lg:sticky lg:top-24">
          <SpecialRequestForm />
        </div>
      </div>
    </div>
  );
}
