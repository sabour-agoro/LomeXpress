import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/config";
import { buildWhatsAppLink } from "@/lib/utils";
import ElectricBorder from "@/components/ui/electric-border";

export const metadata: Metadata = {
  title: "Contact",
  description: "Une question ? Contactez l'équipe LomExpress par WhatsApp, téléphone ou email.",
};

export default function ContactPage() {
  const whatsappLink = buildWhatsAppLink(
    siteConfig.whatsappNumber,
    "Bonjour LomExpress, j'aimerais des informations.",
  );

  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs uppercase tracking-wider text-brand-400">Contact</p>
        <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">
          On vous répond rapidement.
        </h1>
        <p className="mt-3 text-muted-foreground">
          Notre équipe basée à Lomé est disponible pour répondre à toutes vos questions.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <ElectricBorder color="#10b981" borderRadius={24} chaos={0.08} thickness={2}>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-3xl bg-card p-6 transition-colors hover:bg-muted/40"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700">
                <MessageCircle className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-display text-lg font-semibold">WhatsApp Business</h2>
              <p className="mt-1 text-sm text-muted-foreground">+{siteConfig.whatsappNumber}</p>
            </a>
          </ElectricBorder>

          <ElectricBorder color="#a855f7" borderRadius={24} chaos={0.08} thickness={2}>
            <a
              href={`tel:+${siteConfig.whatsappNumber}`}
              className="block rounded-3xl bg-card p-6 transition-colors hover:bg-muted/40"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <Phone className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-display text-lg font-semibold">Appel direct</h2>
              <p className="mt-1 text-sm text-muted-foreground">+{siteConfig.whatsappNumber}</p>
            </a>
          </ElectricBorder>

          <ElectricBorder color="#0ea5e9" borderRadius={24} chaos={0.08} thickness={2}>
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="block rounded-3xl bg-card p-6 transition-colors hover:bg-muted/40"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-700">
                <Mail className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-display text-lg font-semibold">Email</h2>
              <p className="mt-1 text-sm text-muted-foreground">{siteConfig.contactEmail}</p>
            </a>
          </ElectricBorder>

          <ElectricBorder color="#C23A1F" borderRadius={24} chaos={0.05} thickness={2}>
            <div className="rounded-3xl bg-card p-6">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <MapPin className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-display text-lg font-semibold">Adresse</h2>
              <p className="mt-1 text-sm text-muted-foreground">{siteConfig.city}</p>
            </div>
          </ElectricBorder>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              Démarrer une conversation WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
