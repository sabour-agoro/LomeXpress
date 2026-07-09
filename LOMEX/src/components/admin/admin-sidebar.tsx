"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  BarChart3,
  Boxes,
  Inbox,
  LayoutDashboard,
  MessageCircle,
  Package,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import LogoImg from "@/assets/Lome.jpeg";

const items = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/admin/produits", label: "Produits", icon: Package },
  { href: "/admin/commandes", label: "Commandes", icon: ShoppingBag },
  { href: "/admin/demandes-speciales", label: "Demandes spéciales", icon: Inbox },
  { href: "/admin/stocks", label: "Stocks", icon: Boxes },
  // { href: "/admin/messages", label: "Messages", icon: MessageCircle },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden border-r border-border bg-card lg:flex lg:flex-col">
      <div className="px-4 py-4">
        <Link href="/admin" className="flex items-center gap-2 font-display text-base font-bold">
          <div className="relative h-8 w-8 overflow-hidden rounded-xl">
            <Image src={LogoImg} alt="Lome Xpress" fill className="object-cover" />
          </div>
          <span className="text-primary">Lome Xpress</span>
        </Link>
        <p className="mt-2 inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
          Administration
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {items.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
