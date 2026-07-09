"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition, type FormEvent } from "react";
import { FaSearch } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Category = { id: string; slug: string; name: string };

const sortOptions = [
  { value: "recent", label: "Plus récents" },
  { value: "ancien", label: "Plus anciens" },
  { value: "prix-asc", label: "Prix croissant" },
  { value: "prix-desc", label: "Prix décroissant" },
];

export function ShopFilters({
  categories,
  initialQuery,
  initialCategory,
  initialSort,
}: {
  categories: Category[];
  initialQuery?: string;
  initialCategory?: string;
  initialSort?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const [query, setQuery] = useState(initialQuery ?? "");

  const updateParam = useCallback(
    (key: string, value?: string) => {
      const next = new URLSearchParams(params.toString());
      if (value && value.length > 0) next.set(key, value);
      else next.delete(key);
      const qs = next.toString();
      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname);
      });
    },
    [params, pathname, router],
  );

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    updateParam("q", query.trim());
  }

  const activeCategory = initialCategory ?? "";
  const activeSort = initialSort ?? "recent";

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 rounded-2xl border border-border bg-card p-2"
      >
        <FaSearch className="ml-3 h-5 w-5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher un produit"
          className="border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <Button type="submit" size="sm">
          Rechercher
        </Button>
      </form>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 py-1 scrollbar-none">
          <button
            type="button"
            onClick={() => updateParam("categorie", "")}
            className={cn(
              "shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition",
              !activeCategory
                ? "border-primary/40 bg-primary/10 text-foreground"
                : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground",
            )}
          >
            Tous
          </button>
          {categories.map((category) => {
            const isActive = activeCategory === category.slug;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => updateParam("categorie", isActive ? "" : category.slug)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition",
                  isActive
                    ? "border-primary/40 bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground",
                )}
              >
                {category.name}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-xs text-muted-foreground">
            Trier
          </label>
          <select
            id="sort"
            value={activeSort}
            onChange={(event) => updateParam("tri", event.target.value)}
            className="h-9 rounded-xl border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-card">
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
