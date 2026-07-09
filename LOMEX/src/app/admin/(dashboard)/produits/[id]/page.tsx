import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";
import { parseProductImages } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">{product.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Édition du produit.</p>
      </header>

      <ProductForm
        categories={categories}
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          stock: product.stock,
          images: parseProductImages(product.images),
          isPopular: product.isPopular,
          isNew: product.isNew,
          isPublished: product.isPublished,
          categoryId: product.categoryId,
        }}
      />
    </div>
  );
}
