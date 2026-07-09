"use client";

import { useMemo } from "react";
import DomeGallery from "@/components/ui/dome-gallery";
import { parseProductImages } from "@/lib/utils";

interface ProductDomeSectionProps {
  products: any[];
  title: string;
  subtitle: string;
}

export function ProductDomeSection({ products, title, subtitle }: ProductDomeSectionProps) {
  const images = useMemo(() => {
    return products.flatMap((p) => {
      const imgs = parseProductImages(p.images);
      return imgs.map((src) => ({ 
        src, 
        alt: p.name,
        price: p.price,
        description: p.description,
        slug: p.slug
      }));
    });
  }, [products]);

  if (images.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container-page mb-10">
        <h2 className="font-display text-3xl font-bold">{title}</h2>
        <p className="mt-2 text-muted-foreground">{subtitle}</p>
      </div>
      <div className="h-[600px] w-full relative">
        <DomeGallery
          images={images}
          fit={0.8}
          minRadius={600}
          maxVerticalRotationDeg={0}
          segments={34}
          dragDampening={2}
          grayscale={false}
        />
      </div>
    </section>
  );
}
