import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import LomeImage from "@/assets/Lome.jpeg";

export const metadata: Metadata = {
  title: "Connexion admin",
  robots: { index: false },
};

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden relative overflow-hidden lg:flex">
        <Image
          src={LomeImage}
          alt="LomeXpress Admin"
          fill
          className="object-cover"
          priority
        />
        {/* Subtly overlaying the logo or brand name can still be good, but the user asked for the whole image. I'll keep it bare as requested. */}
      </section>

      <section className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="text-sm text-muted-foreground transition hover:text-foreground"
          >
            ← Retour au site
          </Link>
          <h2 className="mt-6 font-display text-2xl font-bold">Espace administrateur</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Connectez-vous avec vos identifiants admin.
          </p>

          <div className="mt-8">
            <AdminLoginForm />
          </div>
        </div>
      </section>
    </main>
  );
}
