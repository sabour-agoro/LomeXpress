import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { requireAdmin } from "@/lib/require-admin";

const MAX_FILES = 8;
const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export async function POST(req: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard) return guard;

    const formData = await req.formData();
    const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });
    }
    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: `Maximum ${MAX_FILES} fichiers.` }, { status: 400 });
    }

    const uploadDir = join(process.cwd(), "public/uploads");
    await mkdir(uploadDir, { recursive: true });

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const mime = file.type;
      const extFromMime = ALLOWED_TYPES[mime];
      if (!extFromMime) {
        return NextResponse.json(
          { error: `Type non autorisé : ${file.name}. JPEG, PNG, WebP ou GIF uniquement.` },
          { status: 400 },
        );
      }
      if (file.size > MAX_BYTES) {
        return NextResponse.json(
          { error: `${file.name} dépasse 2 Mo.` },
          { status: 400 },
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = extFromMime;
      const filename = `${Date.now()}-${randomBytes(6).toString("hex")}${ext}`;
      await writeFile(join(uploadDir, filename), buffer);
      uploadedUrls.push(`/uploads/${filename}`);
    }

    return NextResponse.json({ urls: uploadedUrls });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Échec de l'upload" }, { status: 500 });
  }
}
