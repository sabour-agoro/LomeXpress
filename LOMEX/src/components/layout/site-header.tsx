"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaTimes, FaStar } from "react-icons/fa";
import { GiShoppingBag, GiHamburgerMenu } from "react-icons/gi";
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/cart-provider";
import { navigation, siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import LogoImg from "@/assets/Lome.jpeg";

export function SiteHeader() {
  const pathname = usePathname();
  const { itemsCount } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold">
          <div className="relative h-10 w-10 overflow-hidden rounded-xl shadow-sm">
            <Image src={LogoImg} alt={siteConfig.name} fill sizes="40px" className="object-cover" />
          </div>
          <span className="text-base font-bold text-primary tracking-tight">{siteConfig.name}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navigation.main.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-semibold transition",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex h-9">
            <Link href="/panier" className="relative flex items-center gap-2">
              <GiShoppingBag className="h-5 w-5" />
              <span className="font-semibold">Panier</span>
              {itemsCount > 0 && (
                <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground shadow-sm">
                  {itemsCount}
                </span>
              )}
            </Link>
          </Button>
          <Button asChild size="sm" className="hidden md:inline-flex h-9 font-semibold">
            <Link href="/commande-speciale">Commande spéciale</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-10 w-10"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <FaTimes className="h-6 w-6" /> : <GiHamburgerMenu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background/95 md:hidden shadow-lg">
          <div className="container-page flex flex-col gap-1 py-4">
            {navigation.main.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-base font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/panier"
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 text-base font-semibold text-muted-foreground hover:bg-muted hover:text-foreground flex items-center justify-between transition-colors"
            >
              Panier 
              {itemsCount > 0 && (
                <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground">
                  {itemsCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
