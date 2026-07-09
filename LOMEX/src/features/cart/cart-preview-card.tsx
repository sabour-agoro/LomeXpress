"use client";

import Link from "next/link";
import { MessageCircleMore } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/cart-provider";
import { formatXOF } from "@/lib/utils";

export function CartPreviewCard() {
  const { items, total } = useCart();

  return (
    <aside className="rounded-3xl border border-border bg-card p-5 shadow-soft">
      <h3 className="font-display text-base font-semibold">Mon Panier</h3>
      <div className="mt-4 space-y-3 text-sm">
        {items.length === 0 ? (
          <p className="text-muted-foreground">Aucun article pour le moment.</p>
        ) : (
          items.slice(0, 4).map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">Quantite: {item.quantity}</p>
              </div>
              <p className="font-semibold">{formatXOF(item.price * item.quantity)}</p>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <div className="flex items-center justify-between font-semibold">
          <span>Total estime</span>
          <span className="text-primary">{formatXOF(total)}</span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <Button asChild className="w-full">
          <Link href="/panier">Finaliser ma commande</Link>
        </Button>
        {/* <Button asChild variant="secondary" className="w-full">
          <Link href="/chat">
            <MessageCircleMore className="h-4 w-4" />
            Commander via chat
          </Link>
        </Button> */}
      </div>
    </aside>
  );
}
