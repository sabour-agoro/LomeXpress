import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "À propos",
  description: siteConfig.description,
};

export default function AboutPage() {
  return (
    <div className="container-page py-16">
      <header className="max-w-2xl">
        <p className="text-xs uppercase tracking-wider text-primary">LomExpress</p>
        <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">À propos</h1>
        <p className="mt-4 text-muted-foreground">{siteConfig.description}</p>
      </header>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Livraison locale</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Produits disponibles à Lomé et ses environs, avec un suivi humain sur WhatsApp.
          </p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Import express</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Collez un lien Alibaba, Amazon ou Shein : nous gérons l&apos;achat et le dédouanement.
          </p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Paiement</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Commande confirmée avec notre équipe. Modalités (espèces, Mobile Money) convenues
            avant expédition.
          </p>
        </div>
      </div>

      <div className="mt-10">
        <Button asChild size="lg">
          <Link href="/contact">Nous contacter</Link>
        </Button>
      </div>
    </div>
  );
}
