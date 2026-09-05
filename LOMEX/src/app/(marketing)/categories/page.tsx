import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Catégories",
  description: "Explorez toutes les catégories disponibles sur LomExpress.",
};

export const revalidate = 60;

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="container-page py-12">
      <header>
        <p className="text-xs uppercase tracking-wider text-brand-400">Explorer</p>
        <h1 className="font-display text-3xl font-bold md:text-4xl">Toutes les catégories</h1>
        <p className="mt-1 text-muted-foreground">Trouvez vos produits favoris par univers.</p>
      </header>

      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/boutique?categorie=${category.slug}`}
            className="group relative h-56 overflow-hidden rounded-3xl border border-white/10 bg-card/60"
          >
            {category.imageUrl && (
              <Image
                src={category.imageUrl}
                alt={category.name}
                fill
                sizes="(min-width: 1024px) 33vw, 50vw"
                className="object-cover opacity-70 transition group-hover:scale-105 group-hover:opacity-100"
              />
            )}
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="font-display text-xl font-semibold">{category.name}</h2>
              <p className="text-sm text-muted-foreground">
                {category._count.products} produit{category._count.products > 1 ? "s" : ""}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
