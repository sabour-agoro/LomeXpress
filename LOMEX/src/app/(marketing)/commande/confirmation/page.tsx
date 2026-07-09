import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Commande confirmée",
  description: "Votre commande LomExpress a été enregistrée.",
};

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; wa?: string }>;
}) {
  const { reference, wa } = await searchParams;

  return (
    <div className="container-page py-20">
      <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700">
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <h1 className="mt-6 font-display text-2xl font-bold md:text-3xl">
          Commande enregistrée !
        </h1>
        {reference && (
          <p className="mt-2 text-sm text-muted-foreground">
            Référence : <span className="font-mono text-foreground">{reference}</span>
          </p>
        )}
        <p className="mt-4 text-muted-foreground">
          Cliquez sur le bouton ci-dessous pour finaliser votre commande sur WhatsApp avec
          notre équipe. Nous vous confirmerons les modalités de paiement et de livraison.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {wa && (
            <Button asChild size="lg">
              <a href={wa} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" />
                Ouvrir WhatsApp
              </a>
            </Button>
          )}
          <Button asChild size="lg" variant="outline">
            <Link href="/boutique">Continuer mes achats</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
