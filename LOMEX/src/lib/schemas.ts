import { z } from "zod";
import {
  ORDER_CHANNELS,
  ORDER_STATUSES,
  SPECIAL_REQUEST_STATUSES,
} from "@/lib/enums";

export const phoneSchema = z
  .string()
  .min(8, "Numéro trop court")
  .max(20, "Numéro trop long")
  .regex(/^[0-9+\s().-]+$/, "Numéro invalide");

export const orderItemInputSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().max(99),
});

export const orderInputSchema = z.object({
  customerName: z.string().min(2, "Nom requis").max(120),
  customerPhone: phoneSchema,
  customerEmail: z.string().email("Email invalide").optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
  channel: z.enum(ORDER_CHANNELS).default("WHATSAPP"),
  items: z.array(orderItemInputSchema).min(1, "Le panier est vide").max(50),
});

export type OrderInput = z.infer<typeof orderInputSchema>;

export const specialRequestSchema = z.object({
  customerName: z.string().min(2).max(120),
  customerPhone: phoneSchema,
  customerEmail: z.string().email().optional().or(z.literal("")),
  productUrl: z.string().url("Lien invalide").max(500),
  description: z.string().max(2000).optional().or(z.literal("")),
  quantity: z.number().int().positive().max(999).default(1),
});

export type SpecialRequestInput = z.infer<typeof specialRequestSchema>;

export const messageSchema = z.object({
  threadId: z.string().min(1),
  body: z.string().min(1).max(2000),
  authorRole: z.enum(["CLIENT", "ADMIN"]).default("CLIENT"),
  customerName: z.string().min(2).max(120).optional(),
  customerPhone: phoneSchema.optional(),
});

export const productInputSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().optional(),
  description: z.string().min(10).max(5000),
  price: z.number().int().nonnegative(),
  stock: z.number().int().nonnegative().default(0),
  images: z
    .array(
      z.string().min(1).refine((value) => {
        if (value.startsWith("/")) return true;
        try {
          const url = new URL(value);
          return url.protocol === "http:" || url.protocol === "https:";
        } catch {
          return false;
        }
      }, "URL d'image invalide"),
    )
    .default([]),
  isPopular: z.boolean().default(false),
  isNew: z.boolean().default(true),
  isPublished: z.boolean().default(true),
  categoryId: z.string().nullable().optional(),
});

export type ProductInput = z.infer<typeof productInputSchema>;

export const orderStatusUpdateSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

export const specialRequestStatusUpdateSchema = z.object({
  status: z.enum(SPECIAL_REQUEST_STATUSES),
  estimatePrice: z.number().int().nonnegative().optional(),
  notes: z.string().max(2000).optional(),
});

export const stockAdjustmentSchema = z.object({
  delta: z.number().int(),
  reason: z.enum(["RESTOCK", "ADJUSTMENT", "INIT"]),
  reference: z.string().max(120).optional(),
});

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
