import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { LogOut, Search } from "lucide-react";
import { auth, signOut } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminSessionProvider } from "@/components/admin/admin-session-provider";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  return (
    <AdminSessionProvider>
    <div className="grid min-h-screen grid-cols-1 bg-background lg:grid-cols-[260px_1fr]">
      <AdminSidebar />
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Espace admin</p>
            <p className="font-display text-base font-semibold">
              Espace d'administration
            </p>
          </div>
          <div className="flex items-center gap-4">
            <form action="/admin/produits" className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                name="q"
                type="search"
                placeholder="Rechercher un produit..."
                className="h-9 w-64 rounded-xl border border-border bg-background pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </form>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin/login" });
              }}
            >
              <Button variant="ghost" size="sm" type="submit" className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </Button>
            </form>
          </div>
        </header>
        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
    </AdminSessionProvider>
  );
}
