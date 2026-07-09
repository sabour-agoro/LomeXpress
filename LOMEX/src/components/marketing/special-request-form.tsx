"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState = {
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  productUrl: "",
  description: "",
  quantity: 1,
};

export function SpecialRequestForm() {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  function update<K extends keyof typeof initialState>(key: K, value: (typeof initialState)[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setSuccess(null);
    try {
      const response = await fetch("/api/special-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error ?? "Échec de l'envoi.");
        return;
      }
      setSuccess(data.reference);
      setForm(initialState);
      toast.success("Demande envoyée", { description: `Référence ${data.reference}` });
    } catch (error) {
      console.error(error);
      toast.error("Une erreur réseau est survenue.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-3xl border border-emerald-500/30 bg-card/60 p-8 text-center shadow-soft">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
          <Sparkles className="h-5 w-5" />
        </span>
        <h2 className="mt-4 font-display text-xl font-bold">Demande reçue !</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Référence <span className="font-mono text-foreground">{success}</span>. Notre équipe
          vous contacte sous 24h ouvrées.
        </p>
        <Button className="mt-6" onClick={() => setSuccess(null)} variant="outline">
          Faire une autre demande
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-white/10 bg-card/60 p-6 shadow-soft"
    >
      <h2 className="font-display text-xl font-bold">Décrivez votre besoin</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Nous vous répondons sous 24h avec un devis tout compris.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <Label htmlFor="productUrl">Lien du produit</Label>
          <Input
            id="productUrl"
            value={form.productUrl}
            onChange={(event) => update("productUrl", event.target.value)}
            placeholder="https://www.alibaba.com/…"
            type="url"
            required
            className="mt-1"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="quantity">Quantité</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              value={form.quantity}
              onChange={(event) => update("quantity", Number(event.target.value))}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="customerPhone">Téléphone WhatsApp</Label>
            <Input
              id="customerPhone"
              value={form.customerPhone}
              onChange={(event) => update("customerPhone", event.target.value)}
              placeholder="+228 90 00 00 00"
              required
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="customerName">Votre nom</Label>
          <Input
            id="customerName"
            value={form.customerName}
            onChange={(event) => update("customerName", event.target.value)}
            placeholder="Jean Mensah"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="customerEmail">Email (optionnel)</Label>
          <Input
            id="customerEmail"
            type="email"
            value={form.customerEmail}
            onChange={(event) => update("customerEmail", event.target.value)}
            placeholder="vous@email.com"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="description">Précisions (optionnel)</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
            placeholder="Couleur souhaitée, variante, taille…"
            className="mt-1"
          />
        </div>
      </div>

      <Button type="submit" size="lg" disabled={submitting} className="mt-6 w-full">
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Envoyer ma demande
      </Button>
    </form>
  );
}
