import Link from "next/link";
import Image from "next/image";
import { navigation, siteConfig } from "@/lib/config";
import LogoImg from "@/assets/Lome.jpeg";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-card/70">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <div className="relative h-9 w-9 overflow-hidden rounded-2xl shadow-soft">
              <Image src={LogoImg} alt={siteConfig.name} fill className="object-cover" />
            </div>
            <span className="gradient-text">{siteConfig.name}</span>
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">{siteConfig.description}</p>
        </div>

        {navigation.footer.map((column) => (
          <div key={column.title}>
            <h4 className="text-sm font-semibold text-foreground">{column.title}</h4>
            <ul className="mt-4 space-y-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted-foreground md:flex-row">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. Tous droits réservés.
          </p>
          <p>{siteConfig.city}</p>
        </div>
      </div>
    </footer>
  );
}
