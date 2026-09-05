import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { orderStatusUpdateSchema } from "@/lib/schemas";
import { requireAdmin } from "@/lib/require-admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { id } = await params;
  const json = await request.json().catch(() => null);
  const parsed = orderStatusUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });

  const logs = await prisma.stockLog.findMany({
    where: { reference: order.reference },
    select: { reason: true, delta: true },
  });
  const hasReservation = logs.some((log) => log.reason === "ORDER" && log.delta < 0);
  const hasRestore = logs.some((log) => log.reason === "ORDER_CANCEL" && log.delta > 0);

  if (parsed.data.status === "CONFIRMED" && order.status === "PENDING") {
    if (hasReservation) {
      await prisma.order.update({ where: { id }, data: { status: "CONFIRMED" } });
      return NextResponse.json({ status: "CONFIRMED" });
    }

    try {
      await prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          const reserved = await tx.product.updateMany({
            where: { id: item.productId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
          if (reserved.count !== 1) {
            throw new Error(`STOCK:${item.nameSnapshot}`);
          }
        }
        await tx.order.update({ where: { id }, data: { status: "CONFIRMED" } });
        await tx.stockLog.createMany({
          data: order.items.map((item) => ({
            productId: item.productId,
            delta: -item.quantity,
            reason: "ORDER",
            reference: order.reference,
          })),
        });
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.startsWith("STOCK:")) {
        return NextResponse.json(
          { error: `Stock insuffisant pour ${message.slice(6)}.` },
          { status: 400 },
        );
      }
      throw error;
    }
    return NextResponse.json({ status: "CONFIRMED" });
  }

  const shouldRestore =
    parsed.data.status === "CANCELLED" &&
    (order.status === "PENDING" || order.status === "CONFIRMED") &&
    hasReservation &&
    !hasRestore;

  if (shouldRestore) {
    await prisma.$transaction([
      prisma.order.update({ where: { id }, data: { status: "CANCELLED" } }),
      ...order.items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        }),
      ),
      ...order.items.map((item) =>
        prisma.stockLog.create({
          data: {
            productId: item.productId,
            delta: item.quantity,
            reason: "ORDER_CANCEL",
            reference: order.reference,
          },
        }),
      ),
    ]);
    return NextResponse.json({ status: "CANCELLED" });
  }

  await prisma.order.update({ where: { id }, data: { status: parsed.data.status } });
  return NextResponse.json({ status: parsed.data.status });
}
