import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { specialRequestSchema } from "@/lib/schemas";
import { generateReference } from "@/lib/utils";

export async function POST(request: Request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  const parsed = specialRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const reference = generateReference("SPE");

  const created = await prisma.specialRequest.create({
    data: {
      reference,
      productUrl: parsed.data.productUrl,
      description: parsed.data.description || null,
      quantity: parsed.data.quantity ?? 1,
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      customerEmail: parsed.data.customerEmail || null,
    },
  });

  return NextResponse.json({
    id: created.id,
    reference: created.reference,
    status: created.status,
  });
}
