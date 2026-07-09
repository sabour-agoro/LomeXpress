import { TrendingUp, ShoppingBag, Inbox, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatXOF } from "@/lib/utils";

export const dynamic = "force-dynamic";

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export default async function AdminAnalyticsPage() {
  const now = new Date();
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startWeek = new Date(now);
  startWeek.setDate(now.getDate() - 7);

  const [totalOrders, totalRevenue, ordersThisMonth, revenueThisMonth, ordersThisWeek, totalRequests, topProducts, dailyOrders] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.order.count({ where: { createdAt: { gte: startMonth } } }),
      prisma.order.aggregate({
        where: { createdAt: { gte: startMonth } },
        _sum: { total: true },
      }),
      prisma.order.count({ where: { createdAt: { gte: startWeek } } }),
      prisma.specialRequest.count(),
      prisma.orderItem.groupBy({
        by: ["productId", "nameSnapshot"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: startWeek } },
        select: { createdAt: true, total: true },
      }),
    ]);

  const dailyMap = new Map<string, { count: number; total: number }>();
  for (let i = 6; i >= 0; i--) {
    const date = startOfDay(new Date());
    date.setDate(date.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    dailyMap.set(key, { count: 0, total: 0 });
  }
  for (const order of dailyOrders) {
    const key = startOfDay(order.createdAt).toISOString().slice(0, 10);
    const entry = dailyMap.get(key);
    if (entry) {
      entry.count += 1;
      entry.total += order.total;
    }
  }
  const dailySeries = Array.from(dailyMap.entries()).map(([day, value]) => ({
    day,
    ...value,
  }));
  const maxDaily = Math.max(1, ...dailySeries.map((d) => d.count));

  const stats = [
    {
      label: "Commandes totales",
      value: totalOrders,
      icon: ShoppingBag,
    },
    {
      label: "CA cumulé",
      value: formatXOF(totalRevenue._sum.total ?? 0),
      icon: TrendingUp,
    },
    {
      label: "CA du mois",
      value: formatXOF(revenueThisMonth._sum.total ?? 0),
      icon: TrendingUp,
      hint: `${ordersThisMonth} commande${ordersThisMonth > 1 ? "s" : ""}`,
    },
    {
      label: "Demandes spéciales",
      value: totalRequests,
      icon: Inbox,
    },
    {
      label: "Cette semaine",
      value: ordersThisWeek,
      icon: Users,
      hint: "commandes",
    },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl font-bold">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Synthèse de vos performances. Phase 2 ajoutera les graphiques avancés.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-3xl border border-border bg-card p-5 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </p>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <stat.icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 font-display text-xl font-bold">{stat.value}</p>
            {stat.hint && (
              <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
            )}
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-3xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Commandes (7 derniers jours)</h2>
          <div className="mt-6 rounded-2xl border border-border bg-background p-4">
            <svg viewBox="0 0 620 220" className="h-52 w-full">
              <polyline
                fill="none"
                stroke="#3ABEF9"
                strokeWidth="3"
                points={dailySeries
                  .map((day, index) => {
                    const x = index * (620 / Math.max(1, dailySeries.length - 1));
                    const y = 180 - (day.count / maxDaily) * 130;
                    return `${x},${y}`;
                  })
                  .join(" ")}
              />
              <polyline
                fill="none"
                stroke="#C23A1F"
                strokeWidth="3"
                points={dailySeries
                  .map((day, index) => {
                    const x = index * (620 / Math.max(1, dailySeries.length - 1));
                    const y = 180 - Math.min(day.total / Math.max(1, ...dailySeries.map((d) => d.total)), 1) * 130;
                    return `${x},${y}`;
                  })
                  .join(" ")}
              />
            </svg>
          </div>
          <div className="mt-3 flex items-center gap-5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-accent" />
              Commandes
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              Revenus
            </span>
          </div>
          <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs text-muted-foreground">
            {dailySeries.map((day) => {
              return (
                <div key={day.day} className="flex flex-col items-center gap-1">
                  <p className="text-xs text-muted-foreground">
                    {new Date(day.day).toLocaleDateString("fr-FR", {
                      weekday: "short",
                      day: "2-digit",
                    })}
                  </p>
                  <p className="font-semibold text-foreground">{day.count}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Top produits</h2>
          <p className="text-xs text-muted-foreground">Sur l&apos;ensemble des commandes</p>
          <ol className="mt-4 space-y-3">
            {topProducts.length === 0 && (
              <li className="text-sm text-muted-foreground">Pas encore de ventes.</li>
            )}
            {topProducts.map((product, index) => (
              <li
                key={product.productId}
                className="flex items-center gap-3 rounded-2xl border border-border bg-background/40 p-3"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium line-clamp-1">{product.nameSnapshot}</p>
                  <p className="text-xs text-muted-foreground">
                    {product._sum.quantity ?? 0} unité
                    {(product._sum.quantity ?? 0) > 1 ? "s" : ""} vendue
                    {(product._sum.quantity ?? 0) > 1 ? "s" : ""}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
