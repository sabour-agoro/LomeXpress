import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productInputSchema } from "@/lib/schemas";
import { slugify } from "@/lib/utils";
import { requireAdmin } from "@/lib/require-admin";

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
