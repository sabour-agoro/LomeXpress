"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileSpreadsheet, Loader2, XCircle, ImagePlus, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ImportResult = {
  imported: number;
  errors: { line: number; message: string }[];
};

const example = `name,price,stock,description,category,images
"Casque audio premium",125000,15,"Réduction de bruit active, 30h d'autonomie","Audio & Son","https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
"Mini frigo solaire",450000,3,"Frigo basse consommation 12V","Énergie solaire","https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=800&q=80"`;

export function ProductImportForm() {
  const router = useRouter();
  const [csv, setCsv] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

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
      
      setUploadedUrls((prev) => [...prev, ...data.urls]);
      toast.success("Images uploadées avec succès");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'upload des images");
    } finally {
      setUploadingImages(false);
    }
  }

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setCsv(text);
  }

  async function handleSubmit() {
    if (!csv.trim()) {
      toast.error("Aucune donnée CSV à importer.");
      return;
    }
    setSubmitting(true);
    setResult(null);
    try {
      const response = await fetch("/api/admin/products/import", {
        method: "POST",
        headers: { "Content-Type": "text/csv" },
        body: csv,
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error ?? "Échec de l'import");
        return;
      }
      setResult(data);
      toast.success(`${data.imported} produits importés`);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="rounded-3xl border border-white/10 bg-card/60 p-6">
        <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-white/10 bg-background/40 p-10 text-center transition hover:border-primary/40">
          <FileSpreadsheet className="h-7 w-7 text-brand-300" />
          <span className="text-sm font-semibold">Importer un fichier .csv</span>
          <span className="text-xs text-muted-foreground">
            ou collez le contenu directement ci-dessous
          </span>
          <input type="file" accept=".csv,text/csv" className="sr-only" onChange={handleFile} />
        </label>

        <Textarea
          value={csv}
          onChange={(event) => setCsv(event.target.value)}
          placeholder={example}
          className="mt-4 min-h-[280px] font-mono text-xs"
        />

        <div className="mt-4 flex items-center gap-3">
          <Button onClick={handleSubmit} disabled={submitting} size="lg">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Lancer l&apos;import
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setCsv(example)}
            disabled={submitting}
          >
            Charger un exemple
          </Button>
        </div>

        {/* Outil d'upload d'images additionnel */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-background/40 p-4">
          <h3 className="font-display text-sm font-semibold flex items-center gap-2">
            <ImagePlus className="h-4 w-4" /> Outil d'upload d'images
          </h3>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Uploadez vos images ici pour récupérer leurs liens et les coller dans votre fichier CSV.
          </p>
          <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-xs font-medium transition hover:bg-muted mb-4">
            {uploadingImages ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            Sélectionner des images
            <input type="file" multiple accept="image/*" className="sr-only" onChange={handleFileUpload} disabled={uploadingImages} />
          </label>
          
          {uploadedUrls.length > 0 && (
            <div className="space-y-2">
              {uploadedUrls.map((url, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white/5 rounded p-2 text-xs font-mono">
                  <span className="truncate flex-1">{url}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => { navigator.clipboard.writeText(url); toast.success("Copié !"); }}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <aside className="rounded-3xl border border-white/10 bg-card/60 p-6">
        <h2 className="font-display text-lg font-semibold">Résultat</h2>
        {!result && (
          <p className="mt-3 text-sm text-muted-foreground">
            Lancez un import pour voir le rapport. Les images doivent être séparées par des
            barres verticales <code className="rounded bg-white/10 px-1">|</code>.
          </p>
        )}
        {result && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2 text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-semibold">{result.imported} importés</span>
            </div>
            {result.errors.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-amber-300">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm font-semibold">
                    {result.errors.length} ligne{result.errors.length > 1 ? "s" : ""} ignorée
                    {result.errors.length > 1 ? "s" : ""}
                  </span>
                </div>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {result.errors.map((error, idx) => (
                    <li key={idx} className="rounded-lg bg-white/5 p-2">
                      Ligne {error.line} — {error.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
