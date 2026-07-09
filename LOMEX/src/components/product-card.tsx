import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatXOF, parseProductImages } from "@/lib/utils";
import { LOW_STOCK_THRESHOLD } from "@/lib/enums";
import { AddToCartButton } from "@/features/cart/add-to-cart-button";

type ProductCardProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  stock: number;
  images: string;
  isPopular?: boolean;
  isNew?: boolean;
  category?: { name: string; slug: string } | null;
};

export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductCardProduct;
  priority?: boolean;
}) {
  const images = parseProductImages(product.images);
  const cover =
    images[0] ??
    "https://images.unsplash.com/photo-1586892477838-2b96e85e0f96?auto=format&fit=crop&w=800&q=80";
  const isLowStock = product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition hover:-translate-y-1 hover:border-primary/40">
      <Link href={`/produit/${product.slug}`} className="relative aspect-square overflow-hidden">
        <Image
          src={cover}
          alt={product.name}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {product.isNew && <Badge variant="accent">Nouveau</Badge>}
          {product.isPopular && <Badge>Populaire</Badge>}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        {product.category && (
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {product.category.name}
          </p>
        )}
        <Link href={`/produit/${product.slug}`} className="font-display text-lg font-semibold leading-tight">
          {product.name}
        </Link>
        <div className="mt-auto flex items-end justify-between gap-2">
          <div>
            <p className="text-xl font-bold text-primary">{formatXOF(product.price)}</p>
            {isLowStock ? (
              <p className="text-xs text-amber-700">Plus que {product.stock} en stock</p>
            ) : product.stock <= 0 ? (
              <p className="text-xs text-destructive">Rupture</p>
            ) : (
              <p className="text-xs text-emerald-700">En stock</p>
            )}
          </div>
          <AddToCartButton
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              stock: product.stock,
              image: cover,
            }}
            size="sm"
            label="Ajouter"
          />
        </div>
      </div>
    </article>
  );
}
