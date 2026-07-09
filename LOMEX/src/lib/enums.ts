export const USER_ROLES = ["CLIENT", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

export const ORDER_CHANNELS = ["WHATSAPP", "INTERNAL_CHAT"] as const;
export type OrderChannel = (typeof ORDER_CHANNELS)[number];

export const SPECIAL_REQUEST_STATUSES = [
  "PENDING",
  "QUOTED",
  "CONFIRMED",
  "DELIVERED",
  "CANCELLED",
] as const;
export type SpecialRequestStatus = (typeof SPECIAL_REQUEST_STATUSES)[number];

export const SPECIAL_REQUEST_STATUS_LABELS: Record<SpecialRequestStatus, string> = {
  PENDING: "Nouvelle",
  QUOTED: "Devis envoyé",
  CONFIRMED: "Confirmée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

export const STOCK_REASONS = ["RESTOCK", "ORDER", "ADJUSTMENT", "INIT"] as const;
export type StockReason = (typeof STOCK_REASONS)[number];

export const LOW_STOCK_THRESHOLD = 5;
