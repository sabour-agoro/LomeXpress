import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const xofFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "XOF",
  maximumFractionDigits: 0,
});

export function formatXOF(value: number) {
  return xofFormatter.format(value).replace("XOF", "FCFA");
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export const FALLBACK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1586892477838-2b96e85e0f96?auto=format&fit=crop&w=800&q=80";

export function parseProductImages(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function isDisplayableImageUrl(src: string) {
  if (src.startsWith("/")) return true;
  try {
    const { hostname, protocol } = new URL(src);
    if (protocol !== "http:" && protocol !== "https:") return false;
    return hostname !== "example.com" && !hostname.endsWith(".example.com");
  } catch {
    return false;
  }
}

export function filterDisplayableImages(urls: string[]) {
  return urls.filter(isDisplayableImageUrl);
}

export function displayProductImages(raw: string | null | undefined): string[] {
  return filterDisplayableImages(parseProductImages(raw));
}

export function productCover(raw: string | null | undefined, fallback = FALLBACK_PRODUCT_IMAGE) {
  return displayProductImages(raw)[0] ?? fallback;
}

export function isDisplayableImageSrc(src: string | null | undefined, fallback = FALLBACK_PRODUCT_IMAGE) {
  if (!src) return fallback;
  return isDisplayableImageUrl(src) ? src : fallback;
}

export function generateReference(prefix: string) {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0");
  return `${prefix}-${year}-${random}`;
}

export function buildWhatsAppLink(phone: string, message: string) {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function truncate(value: string, max = 120) {
  if (value.length <= max) return value;
  return value.slice(0, max - 1).trimEnd() + "…";
}
