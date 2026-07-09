import Link from "next/link";
import { FileSpreadsheet, Plus, MessageCircleMore } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { ProductsTable } from "@/components/admin/products-table";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const query = (await searchParams).q;

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: query
        ? {
            OR: [
              { name: { contains: query } },
              { slug: { contains: query } },
            ],
          }
        : undefined,
      include: { category: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Produits</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Catalogue complet — {products.length} produit{products.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/produits/import">
              <FileSpreadsheet className="h-4 w-4" />
              Import CSV
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/produits/nouveau">
              <Plus className="h-4 w-4" />
              Nouveau produit
            </Link>
          </Button>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <ProductsTable products={products} categories={categories} />

        <aside className="h-fit rounded-3xl border border-border bg-card p-5 shadow-soft">
          <h2 className="font-display text-base font-semibold">Demandes de conciergerie</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-2xl border border-border bg-muted/40 p-3">
              <p className="font-medium">Alice M. (Import USA)</p>
              <p className="text-xs text-muted-foreground">En cours</p>
            </div>
            <div className="rounded-2xl border border-border bg-muted/40 p-3">
              <p className="font-medium">Jean-Paul D. (Achat special)</p>
              <p className="text-xs text-muted-foreground">En attente</p>
            </div>
          </div>
          <Button asChild className="mt-4 w-full">
            <Link href="/admin/demandes-speciales">
              <MessageCircleMore className="h-4 w-4" />
              Ouvrir le suivi
            </Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
