import Link from "next/link";
import { FaSearch, FaStar } from "react-icons/fa";
import { GiEarthAfricaEurope, GiTruck, GiCheckedShield } from "react-icons/gi";
import { Button } from "@/components/ui/button";
import { HeroSearch } from "@/components/marketing/hero-search";
import GlassSurface from "@/components/ui/glass-surface";

const stats = [
  { value: "24h", label: "Livraison locale" },
  { value: "Europe / USA", label: "Importation express" },
  { value: "WhatsApp", label: "Paiement convenu avec l’équipe" },
];

export function HeroSection() {
  return (
    <section className="container-page pb-16 pt-10 md:pt-14">
      <GlassSurface borderRadius={24} className="overflow-hidden border border-border">
        <div className="grid md:grid-cols-2 w-full">
          <div className="border-b border-border p-8 md:border-b-0 md:border-r md:p-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
              <FaStar className="h-4 w-4" />
              Service local
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight md:text-5xl">
              Expédition
              <br />
              Express Lomé
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">
              Livraison locale en 24h pour vos produits essentiels et premium.
            </p>
            <div className="mt-6">
              <Button asChild size="lg">
                <Link href="/boutique">
                  <FaSearch className="mr-2 h-4 w-4" />
                  Acheter en local
                </Link>
              </Button>
            </div>
          </div>
          <div className="bg-sky-50/30 p-8 md:p-10 backdrop-blur-sm">
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700">
              <GiEarthAfricaEurope className="h-5 w-5" />
              Service international
            </span>
            <h2 className="mt-5 font-display text-4xl font-bold leading-tight md:text-5xl">
              Conciergerie
              <br />
              Internationale
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Import express Europe et USA avec suivi humain sur WhatsApp.
            </p>
            <div className="mt-6">
              <Button asChild size="lg" variant="secondary">
                <Link href="/commande-speciale">Démarrer ma demande</Link>
              </Button>
            </div>
          </div>
        </div>
      </GlassSurface>

      <div className="mt-6">
        <HeroSearch />
      </div>

      <ul className="mt-6 grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
        {stats.map((stat) => (
          <li key={stat.label}>
            <GlassSurface borderRadius={16} className="border border-border px-4 py-4">
              <div className="w-full">
                <p className="font-display text-xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </GlassSurface>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-2 text-sm">
          <GiTruck className="h-8 w-8 text-brand-500 drop-shadow-sm" /> Livraison toute la zone Togo
        </span>
        <span className="flex items-center gap-2 text-sm">
          <GiCheckedShield className="h-8 w-8 text-emerald-600 drop-shadow-sm" /> Sécurité garantie
        </span>
      </div>
    </section>
  );
}
