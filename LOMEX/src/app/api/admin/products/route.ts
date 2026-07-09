import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productInputSchema } from "@/lib/schemas";
import { slugify } from "@/lib/utils";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  return null;
}

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const json = await request.json().catch(() => null);
  const parsed = productInputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const slug = parsed.data.slug?.trim() || slugify(parsed.data.name);
  const exists = await prisma.product.findUnique({ where: { slug } });
  if (exists) {
    return NextResponse.json({ error: "Slug déjà utilisé." }, { status: 409 });
  }

  const product = await prisma.product.create({
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      price: parsed.data.price,
      stock: parsed.data.stock,
      images: JSON.stringify(parsed.data.images),
      isPopular: parsed.data.isPopular,
      isNew: parsed.data.isNew,
      isPublished: parsed.data.isPublished,
      categoryId: parsed.data.categoryId ?? null,
    },
  });

  if (parsed.data.stock > 0) {
    await prisma.stockLog.create({
      data: { productId: product.id, delta: parsed.data.stock, reason: "INIT" },
    });
  }

  return NextResponse.json({ id: product.id });
}
