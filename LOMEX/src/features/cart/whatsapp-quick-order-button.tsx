"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildWhatsAppLink, formatXOF } from "@/lib/utils";
import { siteConfig } from "@/lib/config";

type Props = {
  product: { name: string; price: number; slug: string };
};

export function WhatsAppQuickOrderButton({ product }: Props) {
  const url = `${siteConfig.url}/produit/${product.slug}`;
  const message = `Bonjour LomExpress, je souhaite commander :\n\n• ${product.name} — ${formatXOF(product.price)}\n${url}\n\nMerci !`;

  return (
    <Button asChild size="lg" variant="outline">
      <a
        href={buildWhatsAppLink(siteConfig.whatsappNumber, message)}
        target="_blank"
        rel="noopener noreferrer"
      >
        <MessageCircle className="h-4 w-4" />
        Commander via WhatsApp
      </a>
    </Button>
  );
}
