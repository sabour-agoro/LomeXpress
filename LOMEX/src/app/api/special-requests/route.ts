import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { specialRequestSchema } from "@/lib/schemas";
import { generateReference } from "@/lib/utils";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limited = rateLimit(`special:${clientIp(request)}`, 8, 60_000);
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

  const parsed = specialRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const data = {
    productUrl: parsed.data.productUrl,
    description: parsed.data.description || null,
    quantity: parsed.data.quantity ?? 1,
    customerName: parsed.data.customerName,
    customerPhone: parsed.data.customerPhone,
    customerEmail: parsed.data.customerEmail || null,
  };

  let created = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      created = await prisma.specialRequest.create({
        data: { ...data, reference: generateReference("SPE") },
      });
      break;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        continue;
      }
      console.error("[special-requests] create failed", error);
      return NextResponse.json({ error: "Impossible d'enregistrer la demande." }, { status: 500 });
    }
  }
  if (!created) {
    return NextResponse.json({ error: "Impossible d'enregistrer la demande." }, { status: 500 });
  }

  return NextResponse.json({
    id: created.id,
    reference: created.reference,
    status: created.status,
  });
}
