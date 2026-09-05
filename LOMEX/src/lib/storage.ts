import { createHash, randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export const MAX_UPLOAD_FILES = 8;
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

function hasCloudflareR2() {
  return Boolean(
    process.env.CLOUDFLARE_ACCOUNT_ID &&
      process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
      process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY &&
      process.env.CLOUDFLARE_R2_BUCKET &&
      process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL,
  );
}

function cloudinaryConfig() {
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    return {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
    };
  }
  const raw = process.env.CLOUDINARY_URL;
  if (!raw) return null;
  try {
    const parsed = new URL(raw);
    const cloudName = parsed.hostname;
    const apiKey = decodeURIComponent(parsed.username);
    const apiSecret = decodeURIComponent(parsed.password);
    if (cloudName && apiKey && apiSecret) return { cloudName, apiKey, apiSecret };
  } catch {
    return null;
  }
  return null;
}

function hasCloudinary() {
  return Boolean(cloudinaryConfig());
}

export function getStorageDriver(): "cloudflare-r2" | "cloudinary" | "local" {
  if (hasCloudflareR2()) return "cloudflare-r2";
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

async function uploadToCloudflareR2(buffer: Buffer, mime: string, extension: string) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
  const bucket = process.env.CLOUDFLARE_R2_BUCKET!;
  const publicBase = process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL!.replace(/\/$/, "");
  const key = `lomexpress/${Date.now()}-${randomBytes(6).toString("hex")}${extension}`;

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
    },
  });

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: mime,
    }),
  );

  return `${publicBase}/${key}`;
}

async function uploadToCloudinary(buffer: Buffer, mime: string, folder: string) {
  const config = cloudinaryConfig();
  if (!config) throw new Error("Cloudinary n'est pas configuré");
  const { cloudName, apiKey, apiSecret } = config;
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
  if (driver === "cloudflare-r2") return uploadToCloudflareR2(buffer, mime, extension);
  if (driver === "cloudinary") {
    return uploadToCloudinary(buffer, mime, process.env.CLOUDINARY_FOLDER ?? "lomexpress");
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Stockage local impossible en production. Configurez Cloudflare R2 (CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_R2_*) ou Cloudinary.",
    );
  }

  return uploadToLocal(buffer, extension);
}
