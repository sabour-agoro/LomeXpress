import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  Inbox,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { formatXOF } from "@/lib/utils";
import { LOW_STOCK_THRESHOLD, ORDER_STATUS_LABELS } from "@/lib/enums";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [ordersToday, ordersTotal, pendingOrders, pendingSpecial, lowStock, latestOrders, latestSpecial] =
    await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.order.aggregate({ _sum: { total: true }, _count: true }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.specialRequest.count({ where: { status: "PENDING" } }),
      prisma.product.count({
        where: { isPublished: true, stock: { lte: LOW_STOCK_THRESHOLD } },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.specialRequest.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const stats = [
    {
      label: "Commandes aujourd'hui",
      value: ordersToday,
      icon: ShoppingBag,
      hint: `Total ${ordersTotal._count} commandes`,
    },
    {
      label: "Chiffre d'affaires",
      value: formatXOF(ordersTotal._sum.total ?? 0),
      icon: TrendingUp,
      hint: "Toutes commandes confondues",
    },
    {
      label: "Demandes spéciales",
      value: pendingSpecial,
      icon: Inbox,
      hint: "À traiter",
    },
    {
      label: "Stocks faibles",
      value: lowStock,
      icon: Boxes,
      hint: `Seuil ≤ ${LOW_STOCK_THRESHOLD}`,
    },
  ];

  const adminHighlights = [
    { label: "Clics chat", value: "1,284", color: "bg-brand-500" },
    { label: "Conversion", value: "8.4%", color: "bg-accent" },
    { label: "Panier moyen", value: "42,500 FCFA", color: "bg-emerald-500" },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl font-bold">Vue d&apos;ensemble</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {pendingOrders} commande{pendingOrders > 1 ? "s" : ""} en attente. Restez à jour avec
          les indicateurs clés ci-dessous.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-3xl border border-border bg-card p-6 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </p>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <stat.icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-4 font-display text-2xl font-bold">{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold">Dernières commandes</h2>
              <p className="text-xs text-muted-foreground">
                Mettez à jour les statuts depuis la page commandes.
              </p>
            </div>
            <Link
              href="/admin/commandes"
              className="text-xs font-semibold text-primary transition hover:text-brand-700"
            >
              Voir tout <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
            </Link>
          </header>

          <ul className="mt-4 divide-y divide-border">
            {latestOrders.length === 0 && (
              <li className="py-6 text-center text-sm text-muted-foreground">
                Aucune commande pour le moment.
              </li>
            )}
            {latestOrders.map((order) => (
              <li key={order.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">{order.reference}</p>
                  <p className="font-medium">{order.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-sm font-semibold">
                    {formatXOF(order.total)}
                  </p>
                  <Badge
                    variant={
                      order.status === "PENDING"
                        ? "warning"
                        : order.status === "DELIVERED"
                          ? "success"
                          : order.status === "CANCELLED"
                            ? "muted"
                            : "default"
                    }
                  >
                    {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold">Demandes spéciales récentes</h2>
              <p className="text-xs text-muted-foreground">
                Réagissez sous 24h pour conserver votre promesse client.
              </p>
            </div>
            <Link
              href="/admin/demandes-speciales"
              className="text-xs font-semibold text-primary transition hover:text-brand-700"
            >
              Voir tout <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
            </Link>
          </header>

          <ul className="mt-4 divide-y divide-border">
            {latestSpecial.length === 0 && (
              <li className="py-6 text-center text-sm text-muted-foreground">
                Aucune demande pour le moment.
              </li>
            )}
            {latestSpecial.map((request) => (
              <li key={request.id} className="py-3">
                <p className="font-mono text-xs text-muted-foreground">{request.reference}</p>
                <p className="font-medium">{request.customerName}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {request.productUrl}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold">Dashboard chat & conversion</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {adminHighlights.map((highlight) => (
            <div key={highlight.label} className="rounded-2xl border border-border bg-muted/40 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{highlight.label}</p>
              <p className="mt-2 text-xl font-bold">{highlight.value}</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div className={`h-2 w-3/4 rounded-full ${highlight.color}`} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
