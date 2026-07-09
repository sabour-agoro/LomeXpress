import Link from "next/link";
import { Globe2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SpecialOrderCta() {
  return (
    <section className="container-page py-16">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-10 md:p-16">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />

        <div className="relative grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Globe2 className="h-3.5 w-3.5 text-accent" />
              Commande spéciale
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold md:text-4xl">
              Vu un produit ailleurs ? On l&apos;importe pour vous.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Collez le lien Alibaba, Amazon ou n&apos;importe quel site. Notre équipe vous
              propose un devis sous 24h, sans surprise.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/commande-speciale">
                  <Sparkles className="h-4 w-4" />
                  Demander un devis
                </Link>
              </Button>
              {/* <Button asChild size="lg" variant="secondary">
                <Link href="/chat">Ouvrir le chat integre</Link>
              </Button> */}
            </div>
          </div>

          <div className="grid gap-3">
            {["Achat & vérification du produit", "Transport international", "Dédouanement Togo", "Livraison à domicile"].map(
              (step, index) => (
                <div
                  key={step}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-muted/40 p-4"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                  <p className="font-medium">{step}</p>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
