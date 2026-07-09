import { prisma } from "@/lib/prisma";
import { HeroSection } from "@/components/marketing/hero-section";
import { CategoryGrid } from "@/components/marketing/category-grid";
import { ProductCarousel } from "@/components/marketing/product-carousel";
import { ProductDomeSection } from "@/components/marketing/product-dome-section";
import { ValuePropositions } from "@/components/marketing/value-propositions";
import { SpecialOrderCta } from "@/components/marketing/special-order-cta";

export const revalidate = 60;

export default async function HomePage() {
  const [popular, latest, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isPopular: true, isPublished: true },
      include: { category: { select: { name: true, slug: true } } },
      take: 8,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.product.findMany({
      where: { isPublished: true },
      include: { category: { select: { name: true, slug: true } } },
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <>
      <HeroSection />
      <CategoryGrid categories={categories} />
      <ProductDomeSection
        title="Selection locale express"
        subtitle="Les produits livrables rapidement a Lome et ses environs."
        products={popular}
      />
      <ValuePropositions />
      <ProductCarousel
        title="Nouveautes boutique premium"
        subtitle="Catalogue enrichi en continu pour vos commandes locales et importees."
        products={latest}
      />
      <SpecialOrderCta />
    </>
  );
}
