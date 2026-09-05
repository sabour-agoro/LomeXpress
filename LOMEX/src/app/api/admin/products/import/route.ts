import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCsv } from "@/lib/csv";
import { slugify } from "@/lib/utils";
import { requireAdmin } from "@/lib/require-admin";

const REQUIRED_HEADERS = ["name", "price", "stock", "description", "category", "images"];

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const text = await request.text();
  const rows = parseCsv(text);
  if (rows.length < 2) {
    return NextResponse.json({ error: "Fichier vide ou en-têtes manquants" }, { status: 400 });
  }

  const headers = rows[0].map((h) => h.trim().toLowerCase());
  for (const required of REQUIRED_HEADERS) {
    if (!headers.includes(required)) {
      return NextResponse.json(
        { error: `En-tête requis manquant: ${required}` },
        { status: 400 },
      );
    }
  }

  const indexes = {
    name: headers.indexOf("name"),
    price: headers.indexOf("price"),
    stock: headers.indexOf("stock"),
    description: headers.indexOf("description"),
    category: headers.indexOf("category"),
    images: headers.indexOf("images"),
  };

  const categories = await prisma.category.findMany({ select: { id: true, slug: true } });
  const categoryMap = new Map(categories.map((c) => [c.slug, c.id]));
  const existingSlugs = new Set(
    (await prisma.product.findMany({ select: { slug: true } })).map((p) => p.slug),
  );
  const errors: { line: number; message: string }[] = [];
  let imported = 0;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const lineNumber = i + 1;

    const name = (row[indexes.name] ?? "").trim();
    const priceStr = (row[indexes.price] ?? "").trim();
    const stockStr = (row[indexes.stock] ?? "0").trim();
    const description = (row[indexes.description] ?? "").trim();
    const categoryName = (row[indexes.category] ?? "").trim();
    const imagesRaw = (row[indexes.images] ?? "").trim();

    if (!name || !priceStr || !description) {
      errors.push({ line: lineNumber, message: "Champs name, price ou description manquants." });
      continue;
    }

    const price = Number.parseInt(priceStr.replace(/\s/g, ""), 10);
    if (Number.isNaN(price) || price < 0) {
      errors.push({ line: lineNumber, message: `Prix invalide: ${priceStr}` });
      continue;
    }

    const stock = Number.parseInt(stockStr.replace(/\s/g, ""), 10);
    if (Number.isNaN(stock) || stock < 0) {
      errors.push({ line: lineNumber, message: `Stock invalide: ${stockStr}` });
      continue;
    }

    const images = imagesRaw
      .split("|")
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    let categoryId: string | null = null;
    if (categoryName) {
      const categorySlug = slugify(categoryName);
      categoryId = categoryMap.get(categorySlug) ?? null;
      
      if (!categoryId) {
        // Double vérification en base (au cas où)
        const existing = await prisma.category.findUnique({ where: { slug: categorySlug } });
        if (existing) {
          categoryId = existing.id;
        } else {
          const created = await prisma.category.create({
            data: { name: categoryName, slug: categorySlug },
          });
          categoryId = created.id;
        }
        categoryMap.set(categorySlug, categoryId);
      }
    }

    let slug = slugify(name);
    let suffix = 1;
    while (existingSlugs.has(slug)) {
      slug = `${slugify(name)}-${suffix++}`;
    }
    existingSlugs.add(slug);

    try {
      const product = await prisma.product.create({
        data: {
          name,
          slug,
          description,
          price,
          stock,
          images: JSON.stringify(images),
          isPublished: true,
          isNew: true,
          categoryId,
        },
      });
      if (stock > 0) {
        await prisma.stockLog.create({
          data: { productId: product.id, delta: stock, reason: "INIT", reference: "Import CSV" },
        });
      }
      imported++;
    } catch (error: any) {
      console.error("Import error line", lineNumber, error);
      errors.push({
        line: lineNumber,
        message: error?.message || "Erreur lors de la création du produit",
      });
    }
  }

  return NextResponse.json({ imported, errors });
} catch (globalError: any) {
  console.error("Global import error:", globalError);
  return NextResponse.json({ error: globalError?.message || "Erreur interne du serveur" }, { status: 500 });
}
}
