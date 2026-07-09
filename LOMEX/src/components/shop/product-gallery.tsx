"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, productName }: { images: string[]; productName: string }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-border bg-card flex items-center justify-center text-muted-foreground">
        Aucune image
      </div>
    );
  }

  const mainImage = images[activeIndex];

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-border bg-card">
        <Image
          src={mainImage}
          alt={`${productName} - Vue principale`}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover transition-opacity duration-300"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
          {images.map((src, index) => (
            <button
              key={`${src}-${index}`}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative h-20 w-20 flex-shrink-0 snap-start overflow-hidden rounded-2xl border transition-all",
                activeIndex === index
                  ? "border-primary ring-2 ring-primary/20 scale-[1.02]"
                  : "border-border opacity-70 hover:opacity-100 hover:border-primary/50"
              )}
            >
              <Image 
                src={src} 
                alt={`${productName} - Miniature ${index + 1}`} 
                fill 
                className="object-cover" 
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
