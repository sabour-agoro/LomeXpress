"use client";

import { useMemo, useState, useEffect } from "react";
import { Clock3, MapPin, MessageCircle, Paperclip, Send, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/features/cart/cart-provider";
import { siteConfig } from "@/lib/config";
import { buildWhatsAppLink, formatXOF } from "@/lib/utils";

type ChatMessage = {
  id: string | number;
  author: "agent" | "customer";
  content: string;
};

const starterMessages: ChatMessage[] = [
  { id: 1, author: "agent", content: "Bonjour, vous etes en ligne avec l'equipe Lome Xpress." },
  { id: 2, author: "agent", content: "Envoyez votre demande, justificatif ou position en direct." },
];

export function ChatInterface() {
  const { items, total } = useCart();
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages);
  const [draft, setDraft] = useState("");

  const whatsappUrl = useMemo(() => {
    const cartSummary = items.length
      ? items.map((item) => `- ${item.name} x${item.quantity}`).join("\n")
      : "- Panier vide";
    const message = `Bonjour ${siteConfig.name}, je continue la discussion depuis le chat du site.\n\nPanier:\n${cartSummary}`;
    return buildWhatsAppLink(siteConfig.whatsappNumber, message);
  }, [items]);

  const [threadId, setThreadId] = useState<string | null>(null);

  useEffect(() => {
    let id = localStorage.getItem("chat_thread_id");
    if (!id) {
      id = "thread_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("chat_thread_id", id);
    }
    setThreadId(id);

    fetch(`/api/messages?threadId=${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((msg: any) => ({
            id: msg.id,
            author: msg.authorRole === "ADMIN" ? "agent" : "customer",
            content: msg.body,
          }));
          setMessages(formatted);
        }
      })
      .catch(console.error);
  }, []);

  async function handleSend() {
    const trimmedDraft = draft.trim();
    if (!trimmedDraft || !threadId) return;
    
    const tempId = Date.now();
    setMessages((currentMessages) => [
      ...currentMessages,
      { id: tempId, author: "customer", content: trimmedDraft },
    ]);
    setDraft("");

    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId,
          content: trimmedDraft,
          author: "customer"
        }),
      });
    } catch (e) {
      console.error(e);
    }
  }

  async function handleQuickShare(content: string) {
    if (!threadId) return;
    const tempId = Date.now();
    setMessages((currentMessages) => [...currentMessages, { id: tempId, author: "customer", content }]);
    
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId,
          content,
          author: "customer"
        }),
      });
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="container-page py-12">
      <div className="grid gap-6 lg:grid-cols-[220px_1fr_280px]">
        <aside className="h-fit rounded-3xl border border-border bg-card p-4 shadow-soft">
          <h2 className="font-display text-sm font-semibold">Conversations</h2>
          <div className="mt-3 space-y-2">
            <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3">
              <p className="text-sm font-semibold">Lome Xpress Team</p>
              <p className="mt-1 text-xs text-muted-foreground">En ligne maintenant</p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-3">
              <p className="text-sm font-medium">Support livraison</p>
              <p className="mt-1 text-xs text-muted-foreground">Derniere reponse il y a 6 min</p>
            </div>
          </div>
        </aside>

        <section className="rounded-3xl border border-border bg-card p-5 shadow-soft md:p-6">
          <header className="flex items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-success">En ligne</p>
              <h1 className="font-display text-2xl font-bold">Chat Lome Xpress Team</h1>
            </div>
            <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
              Reponse rapide
            </span>
          </header>

          <div className="mt-5 max-h-[440px] space-y-3 overflow-y-auto pr-1">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  message.author === "agent"
                    ? "bg-muted text-foreground"
                    : "ml-auto bg-primary text-primary-foreground"
                }`}
              >
                {message.content}
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => handleQuickShare("Je partage ma position actuelle pour la livraison.")}>
              <MapPin className="h-4 w-4" />
              Partager ma position
            </Button>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-muted">
              <Paperclip className="h-4 w-4" />
              Envoyer justificatif
              <input type="file" className="hidden" />
            </label>
          </div>

          <div className="mt-4 flex gap-2">
            <Input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ecrivez votre message..."
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSend();
              }}
            />
            <Button onClick={handleSend} className="px-4">
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Clock3 className="h-3.5 w-3.5" />
            Temps moyen de reponse: moins de 5 minutes.
          </div>
        </section>

        <aside className="h-fit rounded-3xl border border-border bg-card p-4 shadow-soft">
          <h2 className="font-display text-lg font-semibold">Resume du panier</h2>
          <div className="mt-4 space-y-2 text-sm">
            {items.length ? (
              items.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground">
                    {item.name} x{item.quantity}
                  </span>
                  <span className="font-semibold">{formatXOF(item.price * item.quantity)}</span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">Ajoutez des produits pour alimenter le chat de commande.</p>
            )}
          </div>
          <div className="mt-4 border-t border-border pt-4">
            <p className="flex items-center justify-between font-semibold">
              <span>Total estime</span>
              <span>{formatXOF(total)}</span>
            </p>
          </div>

          <Button asChild className="mt-5 w-full">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" />
              Continuer sur WhatsApp
            </a>
          </Button>
          <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-success" />
            Historique conserve et securise pendant votre commande.
          </p>
        </aside>
      </div>
    </div>
  );
}
