import { createHash, randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

export const MAX_UPLOAD_FILES = 8;
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

function hasCloudinary() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

export function getStorageDriver(): "cloudinary" | "local" {
  if (hasCloudinary()) return "cloudinary";
  return "local";
}

function cloudinarySignature(params: Record<string, string | number>, secret: string) {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1").update(`${payload}${secret}`).digest("hex");
}

async function uploadToCloudinary(buffer: Buffer, mime: string, folder: string) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;
  const timestamp = Math.round(Date.now() / 1000);
  const params = { folder, timestamp };
  const signature = cloudinarySignature(params, apiSecret);

  const form = new FormData();
  form.append("file", `data:${mime};base64,${buffer.toString("base64")}`);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);
  form.append("folder", folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });
  const data = (await response.json()) as { secure_url?: string; error?: { message?: string } };
  if (!response.ok || !data.secure_url) {
    throw new Error(data.error?.message ?? "Échec Cloudinary");
  }
  return data.secure_url;
}

async function uploadToLocal(buffer: Buffer, extension: string) {
  const uploadDir = join(process.cwd(), "public/uploads");
  await mkdir(uploadDir, { recursive: true });
  const filename = `${Date.now()}-${randomBytes(6).toString("hex")}${extension}`;
  await writeFile(join(uploadDir, filename), buffer);
  return `/uploads/${filename}`;
}

export async function storeImage(buffer: Buffer, mime: string) {
  const extension = ALLOWED_IMAGE_TYPES[mime];
  if (!extension) throw new Error("Type d'image non autorisé");

  const driver = getStorageDriver();
  if (driver === "cloudinary") {
    return uploadToCloudinary(buffer, mime, process.env.CLOUDINARY_FOLDER ?? "lomexpress");
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Stockage local impossible en production. Configurez CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET.",
    );
  }

  return uploadToLocal(buffer, extension);
}
