import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { specialRequestStatusUpdateSchema } from "@/lib/schemas";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const json = await request.json().catch(() => null);
  const parsed = specialRequestStatusUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  await prisma.specialRequest.update({
    where: { id },
    data: {
      status: parsed.data.status,
      estimatePrice: parsed.data.estimatePrice ?? null,
      notes: parsed.data.notes ?? null,
    },
  });

  return NextResponse.json({ ok: true });
}
