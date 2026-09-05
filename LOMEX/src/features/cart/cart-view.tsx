"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/features/cart/cart-provider";
import { formatXOF, isDisplayableImageSrc } from "@/lib/utils";

export function CartView() {
  const router = useRouter();
  const { items, total, itemsCount, updateQuantity, removeItem, clear, isHydrated } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });

  if (!isHydrated) {
    return (
      <div className="container-page flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-20">
        <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-card/60 p-10 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
            <ShoppingBag className="h-7 w-7 text-muted-foreground" />
          </span>
          <h1 className="mt-6 font-display text-2xl font-bold">Votre panier est vide</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ajoutez des produits depuis la boutique pour les retrouver ici.
          </p>
          <Button asChild className="mt-6">
            <Link href="/boutique">Découvrir le catalogue</Link>
          </Button>
        </div>
      </div>
    );
  }

  async function handleSubmit() {
    if (!form.name || !form.phone) {
      toast.error("Renseignez votre nom et votre téléphone.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.name,
          customerPhone: form.phone,
          customerEmail: form.email,
          notes: form.notes,
          channel: "WHATSAPP",
          items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error ?? "Échec de l'envoi.");
        return;
      }
      clear();
      toast.success("Commande créée", {
        description: `Référence ${data.order.reference}`,
      });
      router.push(`/commande/confirmation?reference=${data.order.reference}`);
    } catch (error) {
      console.error(error);
      toast.error("Une erreur réseau est survenue.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-page py-12">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-brand-400">Panier</p>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Votre commande</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {itemsCount} article{itemsCount > 1 ? "s" : ""} prêt{itemsCount > 1 ? "s" : ""} à
            commander
          </p>
        </div>
        <Button variant="ghost" onClick={clear}>
          <Trash2 className="h-4 w-4" />
          Vider
        </Button>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-4 rounded-3xl border border-white/10 bg-card/60 p-4"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-white/5">
                {item.image && (
                  <Image
                    src={isDisplayableImageSrc(item.image)}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1">
                <Link
                  href={`/produit/${item.slug}`}
                  className="font-display font-semibold leading-tight"
                >
                  {item.name}
                </Link>
                <p className="text-sm text-muted-foreground">{formatXOF(item.price)} l&apos;unité</p>
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <span className="min-w-[2rem] text-center text-sm font-semibold">
                    {item.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="ml-auto text-xs text-muted-foreground transition hover:text-destructive"
                  >
                    Retirer
                  </button>
                </div>
              </div>
              <p className="font-display text-lg font-bold text-primary">
                {formatXOF(item.price * item.quantity)}
              </p>
            </li>
          ))}
        </ul>

        <aside className="flex h-fit flex-col gap-4 rounded-3xl border border-white/10 bg-card/60 p-6 shadow-soft">
          <h2 className="font-display text-lg font-semibold">Validation</h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Sous-total</span>
              <span>{formatXOF(total)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Livraison</span>
              <span>À confirmer</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3 font-display text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">{formatXOF(total)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="name">Votre nom</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(event) => setForm((s) => ({ ...s, name: event.target.value }))}
                placeholder="Jean Mensah"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone WhatsApp</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(event) => setForm((s) => ({ ...s, phone: event.target.value }))}
                placeholder="+228 90 00 00 00"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email (optionnel)</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(event) => setForm((s) => ({ ...s, email: event.target.value }))}
                placeholder="vous@email.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(event) => setForm((s) => ({ ...s, notes: event.target.value }))}
                placeholder="Adresse de livraison, préférences…"
                className="mt-1"
              />
            </div>
          </div>

          <Button size="lg" disabled={submitting} onClick={handleSubmit}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Valider et envoyer sur WhatsApp
          </Button>
          {/* <Button asChild size="lg" variant="secondary">
            <Link href="/chat">Discuter d&apos;abord sur le chat integre</Link>
          </Button> */}
          <p className="text-xs text-muted-foreground">
            Une fois validé, vous serez redirigé vers WhatsApp avec votre récapitulatif prérempli.
          </p>
        </aside>
      </div>
    </div>
  );
}
