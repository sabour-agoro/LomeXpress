import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { orderStatusUpdateSchema } from "@/lib/schemas";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  return null;
}

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

  if (parsed.data.status === "CONFIRMED" && order.status === "PENDING") {
    await prisma.$transaction([
      prisma.order.update({
        where: { id },
        data: { status: "CONFIRMED" },
      }),
      ...order.items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        }),
      ),
      ...order.items.map((item) =>
        prisma.stockLog.create({
          data: {
            productId: item.productId,
            delta: -item.quantity,
            reason: "ORDER",
            reference: order.reference,
          },
        }),
      ),
    ]);
    return NextResponse.json({ status: "CONFIRMED" });
  }

  if (parsed.data.status === "CANCELLED" && order.status === "CONFIRMED") {
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
            reason: "ADJUSTMENT",
            reference: `Annulation ${order.reference}`,
          },
        }),
      ),
    ]);
    return NextResponse.json({ status: "CANCELLED" });
  }

  await prisma.order.update({ where: { id }, data: { status: parsed.data.status } });
  return NextResponse.json({ status: parsed.data.status });
}
