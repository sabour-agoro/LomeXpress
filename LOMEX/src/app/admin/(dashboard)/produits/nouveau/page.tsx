import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Nouveau produit</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Renseignez les informations principales. Les images sont fournies par URL pour cette
          version (intégration Cloudinary prévue en Phase 2).
        </p>
      </header>

      <ProductForm categories={categories} />
    </div>
  );
}
