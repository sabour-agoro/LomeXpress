import { prisma } from "@/lib/prisma";
import { MessageCircle, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";

export default async function AdminMessagesPage() {
  return <div className="p-8 text-center text-muted-foreground">La fonctionnalité Chat est temporairement désactivée.</div>;
  
  /*
  const messages = await prisma.message.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: true, order: true },
    take: 50,
  });

  // Group messages by threadId (simple grouping for display)
  const threads = messages.reduce((acc, msg) => {
    if (!acc[msg.threadId]) {
      acc[msg.threadId] = [];
    }
    acc[msg.threadId].push(msg);
    return acc;
  }, {} as Record<string, typeof messages>);

  const activeThreads = Object.entries(threads);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Messages & Support</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Rechercher..." className="pl-9" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="rounded-3xl border border-border bg-card overflow-hidden h-[600px] flex flex-col shadow-soft">
          <div className="p-4 border-b border-border bg-muted/30">
            <h2 className="font-semibold text-sm">Conversations récentes</h2>
          </div>
          <div className="overflow-y-auto flex-1">
            {activeThreads.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground text-center">Aucun message</p>
            ) : (
              activeThreads.map(([threadId, msgs]) => {
                const latestMsg = msgs[0];
                return (
                  <div key={threadId} className="p-4 border-b border-white/5 cursor-pointer hover:bg-muted/50 transition border-l-2 border-l-transparent hover:border-l-primary">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-semibold text-sm truncate">
                          {latestMsg.author?.name || "Client Anonyme"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {latestMsg.body}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        <section className="rounded-3xl border border-border bg-card shadow-soft h-[600px] flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
              <MessageCircle className="h-8 w-8" />
            </div>
            <h2 className="font-display text-xl font-bold mb-2">Sélectionnez une conversation</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              Ici, vous pourrez bientôt répondre en direct aux clients. Actuellement, la plupart des discussions se poursuivent via WhatsApp.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
  */
}
