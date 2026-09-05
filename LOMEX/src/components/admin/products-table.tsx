"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatXOF, productCover } from "@/lib/utils";
import { LOW_STOCK_THRESHOLD } from "@/lib/enums";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  price: number;
  stock: number;
  images: string;
  isPublished: boolean;
  category?: { name: string; slug: string } | null;
};

type Category = { id: string; slug: string; name: string };

export function ProductsTable({
  products,
  categories: _categories,
}: {
  products: ProductRow[];
  categories: Category[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<{ id: string; name: string } | null>(null);

  async function handleDelete() {
    if (!deletingProduct) return;
    const { id } = deletingProduct;
    setPendingId(id);
    try {
      const response = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error ?? "Suppression impossible");
        return;
      }
      toast.success("Produit supprimé avec succès");
      setDeletingProduct(null);
      startTransition(() => router.refresh());
    } finally {
      setPendingId(null);
    }
  }

  if (products.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
        Aucun produit. Cliquez sur « Nouveau produit » pour commencer.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Produit</th>
              <th className="px-5 py-3">Catégorie</th>
              <th className="px-5 py-3 text-right">Prix</th>
              <th className="px-5 py-3 text-right">Stock</th>
              <th className="px-5 py-3">Statut</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((product) => {
              const cover = productCover(product.images);
              const lowStock = product.stock <= LOW_STOCK_THRESHOLD;
              return (
                <tr key={product.id} className="transition hover:bg-muted/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-muted">
                        {cover && (
                          <Image src={cover} alt={product.name} fill sizes="48px" className="object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">
                    {product.category?.name ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-right font-display text-sm font-semibold">
                    {formatXOF(product.price)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className={lowStock ? "text-amber-700" : ""}>{product.stock}</span>
                  </td>
                  <td className="px-5 py-3">
                    {product.isPublished ? (
                      <Badge variant="success">En ligne</Badge>
                    ) : (
                      <Badge variant="muted">Hors ligne</Badge>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/produits/${product.id}`}>
                          <Pencil className="h-3.5 w-3.5" /> Éditer
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        disabled={pendingId === product.id}
                        onClick={() => setDeletingProduct({ id: product.id, name: product.name })}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Dialog open={!!deletingProduct} onOpenChange={(open) => !open && setDeletingProduct(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Supprimer le produit</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer{" "}
              <span className="font-semibold text-foreground">"{deletingProduct?.name}"</span> ? 
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setDeletingProduct(null)} disabled={!!pendingId}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={!!pendingId}>
              {pendingId ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
