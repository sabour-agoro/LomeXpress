import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { orderInputSchema } from "@/lib/schemas";
import { generateReference, formatXOF } from "@/lib/utils";
import { siteConfig } from "@/lib/config";
import { notifyAdminNewOrder } from "@/lib/email";
import { clientIp, rateLimit } from "@/lib/rate-limit";

function stockError(name: string) {
  return NextResponse.json(
    { error: `Stock insuffisant pour ${name}.` },
    { status: 400 },
  );
}

export async function POST(request: Request) {
  const limited = rateLimit(`orders:${clientIp(request)}`, 8, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez dans une minute." },
      { status: 429 },
    );
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  const parsed = orderInputSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const productIds = data.items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isPublished: true },
  });

  if (products.length !== productIds.length) {
    return NextResponse.json(
      { error: "Un ou plusieurs produits sont indisponibles." },
      { status: 400 },
    );
  }

  const productMap = new Map(products.map((product) => [product.id, product]));
  const itemsToCreate: Prisma.OrderItemCreateWithoutOrderInput[] = [];
  let total = 0;

  for (const input of data.items) {
    const product = productMap.get(input.productId);
    if (!product) {
      return NextResponse.json(
        { error: `Produit ${input.productId} introuvable.` },
        { status: 400 },
      );
    }
    if (product.stock < input.quantity) {
      return stockError(product.name);
    }
    total += product.price * input.quantity;
    itemsToCreate.push({
      product: { connect: { id: product.id } },
      quantity: input.quantity,
      unitPrice: product.price,
      nameSnapshot: product.name,
    });
  }

  let order;
  try {
    order = await prisma.$transaction(async (tx) => {
      for (const input of data.items) {
        const product = productMap.get(input.productId)!;
        const reserved = await tx.product.updateMany({
          where: {
            id: product.id,
            isPublished: true,
            stock: { gte: input.quantity },
          },
          data: { stock: { decrement: input.quantity } },
        });
        if (reserved.count !== 1) {
          throw new Error(`STOCK:${product.name}`);
        }
      }

      let created = null;
      for (let attempt = 0; attempt < 5; attempt++) {
        const reference = generateReference("LOM");
        try {
          created = await tx.order.create({
            data: {
              reference,
              status: "PENDING",
              channel: data.channel,
              customerName: data.customerName,
              customerPhone: data.customerPhone,
              customerEmail: data.customerEmail || null,
              notes: data.notes || null,
              total,
              items: { create: itemsToCreate },
            },
            include: { items: true },
          });
          break;
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            continue;
          }
          throw error;
        }
      }
      if (!created) throw new Error("REFERENCE");

      await tx.stockLog.createMany({
        data: created.items.map((item) => ({
          productId: item.productId,
          delta: -item.quantity,
          reason: "ORDER",
          reference: created!.reference,
        })),
      });

      return created;
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.startsWith("STOCK:")) {
      return stockError(message.slice(6));
    }
    console.error("[orders] create failed", error);
    return NextResponse.json({ error: "Impossible de créer la commande." }, { status: 500 });
  }

  const messageLines = [
    `Bonjour LomExpress, je souhaite passer la commande ${order.reference} :`,
    "",
    ...order.items.map(
      (item) =>
        `• ${item.quantity} × ${item.nameSnapshot} — ${formatXOF(item.unitPrice * item.quantity)}`,
    ),
    "",
    `Total : ${formatXOF(order.total)}`,
    `Nom : ${order.customerName}`,
    `Téléphone : ${order.customerPhone}`,
  ];
  if (order.notes) messageLines.push(`Notes : ${order.notes}`);

  const message = messageLines.join("\n");
  const cleanPhone = siteConfig.whatsappNumber.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  notifyAdminNewOrder({
    reference: order.reference,
    total: order.total,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
  }).catch((error) => console.error("[orders] notify failed", error));

  return NextResponse.json({
    order: {
      id: order.id,
      reference: order.reference,
      total: order.total,
      status: order.status,
    },
    whatsappUrl,
    message,
  });
}
