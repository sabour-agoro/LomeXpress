"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { displayProductImages, productCover } from "@/lib/utils";

const DomeGallery = dynamic(() => import("@/components/ui/dome-gallery"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted/30" aria-hidden />,
});

interface ProductDomeSectionProps {
  products: {
    name: string;
    price: number;
    description: string;
    slug: string;
    images: string;
  }[];
  title: string;
  subtitle: string;
}

export function ProductDomeSection({ products, title, subtitle }: ProductDomeSectionProps) {
  const images = useMemo(() => {
    return products.map((product) => {
      const srcs = displayProductImages(product.images);
      return {
        src: srcs[0] ?? productCover(product.images),
        alt: product.name,
        price: product.price,
        description: product.description,
        slug: product.slug,
      };
    });
  }, [products]);

  if (images.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container-page mb-10">
        <h2 className="font-display text-3xl font-bold">{title}</h2>
        <p className="mt-2 text-muted-foreground">{subtitle}</p>
      </div>
      <div className="relative h-[min(70vh,640px)] w-full overflow-hidden">
        <DomeGallery
          images={images}
          fit={0.48}
          minRadius={180}
          maxVerticalRotationDeg={8}
          segments={16}
          dragDampening={2}
          grayscale={false}
          overlayBlurColor="#f7f8fa"
        />
      </div>
    </section>
  );
}
