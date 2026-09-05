import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ShieldCheck, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/shop/product-gallery";
import { AddToCartButton } from "@/features/cart/add-to-cart-button";
import { WhatsAppQuickOrderButton } from "@/features/cart/whatsapp-quick-order-button";
import { formatXOF, parseProductImages, productCover, truncate } from "@/lib/utils";
import { LOW_STOCK_THRESHOLD } from "@/lib/enums";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return { title: "Produit introuvable" };
  return {
    title: product.name,
    description: truncate(product.description, 160),
    openGraph: {
      title: product.name,
      description: truncate(product.description, 160),
      images: parseProductImages(product.images),
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product || !product.isPublished) notFound();

  const images = parseProductImages(product.images);
  const cover = productCover(product.images);

  const related = await prisma.product.findMany({
    where: {
      isPublished: true,
      categoryId: product.categoryId ?? undefined,
      NOT: { id: product.id },
    },
    include: { category: { select: { name: true, slug: true } } },
    take: 4,
  });

  const isLowStock = product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD;

  return (
    <div className="container-page py-12">
      <Link
        href="/boutique"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Retour à la boutique
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <ProductGallery images={images} productName={product.name} />

        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            {product.category && (
              <Badge variant="outline">
                <Link href={`/boutique?categorie=${product.category.slug}`}>
                  {product.category.name}
                </Link>
              </Badge>
            )}
            {product.isNew && <Badge variant="accent">Nouveau</Badge>}
            {product.isPopular && <Badge>Populaire</Badge>}
          </div>

          <h1 className="font-display text-3xl font-bold leading-tight md:text-4xl">
            {product.name}
          </h1>
          <p className="text-3xl font-bold text-primary">{formatXOF(product.price)}</p>

          <p className="text-sm text-muted-foreground">{product.description}</p>

          <div className="rounded-3xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Disponibilité</span>
              {product.stock <= 0 ? (
                <span className="text-sm font-semibold text-destructive">Rupture</span>
              ) : isLowStock ? (
                <span className="text-sm font-semibold text-amber-700">
                  Plus que {product.stock} en stock
                </span>
              ) : (
                <span className="text-sm font-semibold text-emerald-700">En stock</span>
              )}
            </div>
            <Separator className="my-3" />
            <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              <span className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-brand-500" /> Livraison 24-72h au Togo
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Paiement securise
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <AddToCartButton
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                stock: product.stock,
                image: cover,
              }}
              size="lg"
              label="Ajouter au panier"
            />
            <WhatsAppQuickOrderButton product={product} />
            <Button asChild variant="outline" size="lg">
              <Link href="/commande-speciale">Demander une variante</Link>
            </Button>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-2xl font-bold">Vous aimerez aussi</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
