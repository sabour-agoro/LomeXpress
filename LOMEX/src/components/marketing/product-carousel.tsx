import Link from "next/link";
import { ProductCard } from "@/components/product-card";

type Product = Parameters<typeof ProductCard>[0]["product"];

export function ProductCarousel({
  title,
  subtitle,
  products,
  ctaHref = "/boutique",
}: {
  title: string;
  subtitle?: string;
  products: Product[];
  ctaHref?: string;
}) {
  if (!products.length) return null;

  return (
    <section className="container-page py-16">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold md:text-4xl">{title}</h2>
          {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
        </div>
        <Link
          href={ctaHref}
          className="text-sm font-semibold text-muted-foreground transition hover:text-foreground"
        >
          Voir tout le catalogue →
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} priority={index < 4} />
        ))}
      </div>
    </section>
  );
}
