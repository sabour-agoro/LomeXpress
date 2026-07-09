import type { Metadata } from "next";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product-card";
import { ShopFilters } from "@/components/shop/shop-filters";
import { CartPreviewCard } from "@/features/cart/cart-preview-card";

export const metadata: Metadata = {
  title: "Boutique",
  description: "Catalogue complet LomExpress : téléphones, ordinateurs, énergie solaire et plus.",
};

type SearchParams = {
  q?: string;
  categorie?: string;
  tri?: string;
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q, categorie, tri } = await searchParams;

  const where: Prisma.ProductWhereInput = { isPublished: true };
  if (q?.trim()) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
    ];
  }
  if (categorie) {
    where.category = { slug: categorie };
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    tri === "prix-asc"
      ? { price: "asc" }
      : tri === "prix-desc"
        ? { price: "desc" }
        : tri === "ancien"
          ? { createdAt: "asc" }
          : { createdAt: "desc" };

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      include: { category: { select: { name: true, slug: true } } },
      take: 60,
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="container-page py-10">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-brand-400">Catalogue</p>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Notre Collection</h1>
          <p className="mt-1 text-muted-foreground">
            {products.length} produit{products.length > 1 ? "s" : ""} disponible
            {products.length > 1 ? "s" : ""}
          </p>
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <ShopFilters
            categories={categories}
            initialQuery={q}
            initialCategory={categorie}
            initialSort={tri}
          />

          {products.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-dashed border-border bg-card p-12 text-center">
              <p className="text-lg font-semibold">Aucun produit ne correspond a votre recherche.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Essayez une autre recherche, ou demandez une{" "}
                <Link href="/commande-speciale" className="text-primary underline">
                  commande speciale
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-24 lg:h-fit">
          <CartPreviewCard />
        </div>
      </div>
    </div>
  );
}
