import Link from "next/link";
import { AlertTriangle, ArrowDown, ArrowUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { LOW_STOCK_THRESHOLD } from "@/lib/enums";

export const dynamic = "force-dynamic";

export default async function AdminStocksPage() {
  const [products, recentLogs] = await Promise.all([
    prisma.product.findMany({
      orderBy: { stock: "asc" },
      include: { category: { select: { name: true } } },
    }),
    prisma.stockLog.findMany({
      orderBy: { createdAt: "desc" },
      include: { product: { select: { name: true, slug: true } } },
      take: 30,
    }),
  ]);

  const lowStock = products.filter((p) => p.stock <= LOW_STOCK_THRESHOLD);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl font-bold">Stocks</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vue temps réel des niveaux de stock et historique des mouvements.
        </p>
      </header>

      {lowStock.length > 0 && (
        <section className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-300" />
            <h2 className="font-display text-lg font-semibold text-amber-200">
              {lowStock.length} produit{lowStock.length > 1 ? "s" : ""} en stock faible
            </h2>
          </div>
          <ul className="mt-4 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {lowStock.map((product) => (
              <li
                key={product.id}
                className="flex items-center justify-between rounded-2xl border border-amber-500/20 bg-background/40 px-4 py-3"
              >
                <div>
                  <Link
                    href={`/admin/produits/${product.id}`}
                    className="text-sm font-semibold hover:underline"
                  >
                    {product.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {product.category?.name ?? "Sans catégorie"}
                  </p>
                </div>
                <Badge variant="warning">{product.stock} restant</Badge>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-card/60 p-6">
          <h2 className="font-display text-lg font-semibold">Tous les produits</h2>
          <ul className="mt-4 divide-y divide-white/10">
            {products.map((product) => (
              <li key={product.id} className="flex items-center justify-between py-2 text-sm">
                <Link
                  href={`/admin/produits/${product.id}`}
                  className="line-clamp-1 hover:underline"
                >
                  {product.name}
                </Link>
                <span className="font-display font-semibold">{product.stock}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-white/10 bg-card/60 p-6">
          <h2 className="font-display text-lg font-semibold">Mouvements récents</h2>
          <ul className="mt-4 space-y-3">
            {recentLogs.length === 0 && (
              <li className="text-sm text-muted-foreground">Aucun mouvement enregistré.</li>
            )}
            {recentLogs.map((log) => (
              <li key={log.id} className="flex items-start gap-3 text-sm">
                <span
                  className={
                    "mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full " +
                    (log.delta >= 0
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-rose-500/15 text-rose-300")
                  }
                >
                  {log.delta >= 0 ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
                </span>
                <div className="flex-1">
                  <p className="font-medium">{log.product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {log.delta > 0 ? "+" : ""}
                    {log.delta} · {log.reason}
                    {log.reference ? ` · ${log.reference}` : ""}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(log.createdAt).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                  })}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
