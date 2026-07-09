"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import GlassSurface from "@/components/ui/glass-surface";

export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/boutique?q=${encodeURIComponent(trimmed)}` : "/boutique");
  }

  return (
    <div className="mt-6">
      <GlassSurface borderRadius={20} className="border border-border">
        <form
          onSubmit={handleSubmit}
          className="flex w-full items-center gap-2 p-2"
        >
          <Search className="ml-3 h-5 w-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Que cherchez-vous aujourd'hui ?"
            className="border-0 bg-transparent text-base shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button type="submit" size="sm" className="shrink-0">
            Rechercher
          </Button>
        </form>
      </GlassSurface>
    </div>
  );
}
