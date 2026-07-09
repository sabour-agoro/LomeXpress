import { prisma } from "@/lib/prisma";
import { OrdersTable } from "@/components/admin/orders-table";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const query = (await searchParams).q;

  const orders = await prisma.order.findMany({
    where: query
      ? {
          OR: [
            { reference: { contains: query } },
            { customerName: { contains: query } },
            { customerPhone: { contains: query } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: { items: true },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Commandes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Suivez et mettez à jour le statut de chaque commande.
        </p>
      </header>

      <OrdersTable orders={orders} />
    </div>
  );
}
