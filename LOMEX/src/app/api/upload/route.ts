import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_FILES,
  storeImage,
} from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard) return guard;

    const formData = await req.formData();
    const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });
    }
    if (files.length > MAX_UPLOAD_FILES) {
      return NextResponse.json({ error: `Maximum ${MAX_UPLOAD_FILES} fichiers.` }, { status: 400 });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const mime = file.type;
      if (!ALLOWED_IMAGE_TYPES[mime]) {
        return NextResponse.json(
          { error: `Type non autorisé : ${file.name}. JPEG, PNG, WebP ou GIF uniquement.` },
          { status: 400 },
        );
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        return NextResponse.json({ error: `${file.name} dépasse 2 Mo.` }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      uploadedUrls.push(await storeImage(buffer, mime));
    }

    return NextResponse.json({ urls: uploadedUrls });
  } catch (error) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : "Échec de l'upload";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
