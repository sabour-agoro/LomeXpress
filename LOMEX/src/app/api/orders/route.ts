import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { orderInputSchema } from "@/lib/schemas";
import { generateReference, formatXOF } from "@/lib/utils";
import { siteConfig } from "@/lib/config";
import { notifyAdminNewOrder } from "@/lib/email";

export async function POST(request: Request) {
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
      return NextResponse.json(
        { error: `Stock insuffisant pour ${product.name}.` },
        { status: 400 },
      );
    }
    const lineTotal = product.price * input.quantity;
    total += lineTotal;
    itemsToCreate.push({
      product: { connect: { id: product.id } },
      quantity: input.quantity,
      unitPrice: product.price,
      nameSnapshot: product.name,
    });
  }

  const reference = generateReference("LOM");

  const order = await prisma.order.create({
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
