import { ProductImportForm } from "@/components/admin/product-import-form";

export const dynamic = "force-dynamic";

export default function ProductImportPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Import CSV produits</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Importez en masse vos produits depuis un fichier CSV. La première ligne doit contenir
          les en-têtes : <code className="rounded bg-white/10 px-1 py-0.5 text-xs">name,price,stock,description,category,images</code>.
        </p>
      </header>

      <ProductImportForm />
    </div>
  );
}
