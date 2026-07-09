import Image from "next/image";
import Link from "next/link";

type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
};

export function CategoryGrid({ categories }: { categories: Category[] }) {
  if (!categories.length) return null;

  return (
    <section className="container-page py-16">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-brand-400">Catégories</p>
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Trouvez ce qu&apos;il vous faut, plus vite
          </h2>
        </div>
        <Link
          href="/categories"
          className="text-sm font-semibold text-muted-foreground transition hover:text-foreground"
        >
          Voir toutes les catégories →
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {categories.slice(0, 6).map((category) => (
          <Link
            key={category.id}
            href={`/boutique?categorie=${category.slug}`}
            className="group relative aspect-square overflow-hidden rounded-3xl border border-border bg-card transition hover:-translate-y-1 hover:border-primary/40"
          >
            {category.imageUrl && (
              <Image
                src={category.imageUrl}
                alt={category.name}
                fill
                priority={categories.indexOf(category) < 3}
                sizes="(min-width: 1024px) 16vw, 33vw"
                className="object-cover opacity-70 transition group-hover:opacity-100 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-3 left-3 right-3">
              <p className="font-semibold">{category.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
