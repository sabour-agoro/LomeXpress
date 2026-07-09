"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Save, Trash2, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

type Category = { id: string; slug: string; name: string };

type ProductValues = {
  id?: string;
  name: string;
  slug?: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  isPopular: boolean;
  isNew: boolean;
  isPublished: boolean;
  categoryId: string | null;
};

const empty: ProductValues = {
  name: "",
  description: "",
  price: 0,
  stock: 0,
  images: [],
  isPopular: false,
  isNew: true,
  isPublished: true,
  categoryId: null,
};

export function ProductForm({
  categories,
  product,
}: {
  categories: Category[];
  product?: ProductValues;
}) {
  const router = useRouter();
  const [values, setValues] = useState<ProductValues>(product ?? empty);
  const [imagesText, setImagesText] = useState(product?.images.join("\n") ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  function update<K extends keyof ProductValues>(key: K, value: ProductValues[K]) {
    setValues((s) => ({ ...s, [key]: value }));
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur upload");
      
      const newUrls = data.urls.join("\n");
      setImagesText((prev) => (prev ? `${prev}\n${newUrls}` : newUrls));
      toast.success("Images ajoutées avec succès");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'upload des images");
    } finally {
      setUploadingImages(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const images = imagesText
      .split(/\r?\n/)
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    setSubmitting(true);
    try {
      const url = product?.id
        ? `/api/admin/products/${product.id}`
        : "/api/admin/products";
      const response = await fetch(url, {
        method: product?.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          images,
          price: Number(values.price),
          stock: Number(values.stock),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error ?? "Échec de l'enregistrement");
        return;
      }
      toast.success("Produit enregistré");
      router.push("/admin/produits");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4 rounded-3xl border border-white/10 bg-card/60 p-6">
        <div>
          <Label htmlFor="name">Nom du produit</Label>
          <Input
            id="name"
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={values.description}
            onChange={(event) => update("description", event.target.value)}
            required
            className="mt-1 min-h-[160px]"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="price">Prix (FCFA)</Label>
            <Input
              id="price"
              type="number"
              min={0}
              step={500}
              value={values.price}
              onChange={(event) => update("price", Number(event.target.value))}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              type="number"
              min={0}
              value={values.stock}
              onChange={(event) => update("stock", Number(event.target.value))}
              required
              className="mt-1"
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="images">Images (une URL par ligne)</Label>
            <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium transition hover:bg-muted">
              {uploadingImages ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="h-4 w-4" />
              )}
              Ajouter depuis le PC
              <input type="file" multiple accept="image/*" className="sr-only" onChange={handleFileUpload} disabled={uploadingImages} />
            </label>
          </div>
          <Textarea
            id="images"
            value={imagesText}
            onChange={(event) => setImagesText(event.target.value)}
            placeholder="https://images.unsplash.com/…"
            className="mt-1 min-h-[120px] font-mono text-xs"
          />
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-3xl border border-white/10 bg-card/60 p-6">
          <h2 className="font-display text-lg font-semibold">Organisation</h2>
          <div className="mt-4 space-y-3">
            <div>
              <Label htmlFor="category">Catégorie</Label>
              <select
                id="category"
                value={values.categoryId ?? ""}
                onChange={(event) => update("categoryId", event.target.value || null)}
                className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-card/60 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Sans catégorie</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id} className="bg-card">
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Enregistrer
        </Button>

        {product?.id && (
          <Dialog>
            <DialogTrigger asChild>
              <Button type="button" variant="ghost" className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer le produit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Supprimer définitivement ?</DialogTitle>
                <DialogDescription>
                  Cette action est irréversible. Cela supprimera le produit de la base de données.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Annuler</Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    const response = await fetch(`/api/admin/products/${product.id}`, {
                      method: "DELETE",
                    });
                    if (response.ok) {
                      toast.success("Supprimé");
                      router.push("/admin/produits");
                      router.refresh();
                    } else {
                      toast.error("Erreur lors de la suppression");
                    }
                  }}
                >
                  Confirmer la suppression
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </aside>
    </form>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
      </span>
      <span
        className={
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition " +
          (checked ? "bg-primary" : "bg-white/10")
        }
      >
        <span
          className={
            "inline-block h-4 w-4 transform rounded-full bg-white transition " +
            (checked ? "translate-x-4" : "translate-x-1")
          }
        />
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="sr-only"
      />
    </label>
  );
}
