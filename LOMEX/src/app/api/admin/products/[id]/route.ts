import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productInputSchema } from "@/lib/schemas";
import { slugify } from "@/lib/utils";
import { requireAdmin } from "@/lib/require-admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!product) return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });

  return NextResponse.json(product);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { id } = await params;
  const json = await request.json().catch(() => null);
  const parsed = productInputSchema.partial().safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name;
  if (parsed.data.slug !== undefined && parsed.data.slug !== existing.slug) {
    const slug = parsed.data.slug.trim() || slugify(parsed.data.name ?? existing.name);
    const conflict = await prisma.product.findFirst({ where: { slug, NOT: { id } } });
    if (conflict) return NextResponse.json({ error: "Slug déjà utilisé." }, { status: 409 });
    data.slug = slug;
  }
  if (parsed.data.description !== undefined) data.description = parsed.data.description;
  if (parsed.data.price !== undefined) data.price = parsed.data.price;
  if (parsed.data.images !== undefined) data.images = JSON.stringify(parsed.data.images);
  if (parsed.data.isPopular !== undefined) data.isPopular = parsed.data.isPopular;
  if (parsed.data.isNew !== undefined) data.isNew = parsed.data.isNew;
  if (parsed.data.isPublished !== undefined) data.isPublished = parsed.data.isPublished;
  if (parsed.data.categoryId !== undefined) data.categoryId = parsed.data.categoryId ?? null;

  let stockDelta: number | null = null;
  if (parsed.data.stock !== undefined && parsed.data.stock !== existing.stock) {
    stockDelta = parsed.data.stock - existing.stock;
    data.stock = parsed.data.stock;
  }

  await prisma.product.update({ where: { id }, data });

  if (stockDelta !== null && stockDelta !== 0) {
    await prisma.stockLog.create({
      data: {
        productId: id,
        delta: stockDelta,
        reason: stockDelta > 0 ? "RESTOCK" : "ADJUSTMENT",
        reference: "Ajustement admin",
      },
    });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { id } = await params;

  const orderItemCount = await prisma.orderItem.count({ where: { productId: id } });
  if (orderItemCount > 0) {
    await prisma.product.update({ where: { id }, data: { isPublished: false } });
    return NextResponse.json({
      ok: true,
      softDeleted: true,
      message: "Produit lié à des commandes : dépublication effectuée.",
    });
  }

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
