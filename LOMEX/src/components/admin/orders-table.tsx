"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatXOF } from "@/lib/utils";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/enums";

type OrderRow = {
  id: string;
  reference: string;
  status: string;
  customerName: string;
  customerPhone: string;
  total: number;
  channel: string;
  createdAt: Date;
  items: { quantity: number; nameSnapshot: string }[];
};

const statusVariant: Record<string, "default" | "success" | "muted" | "warning" | "accent"> = {
  PENDING: "warning",
  CONFIRMED: "accent",
  SHIPPED: "default",
  DELIVERED: "success",
  CANCELLED: "muted",
};

export function OrdersTable({ orders }: { orders: OrderRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState<Record<string, string>>({});

  async function handleStatusChange(id: string, status: OrderStatus) {
    setOptimistic((prev) => ({ ...prev, [id]: status }));
    try {
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error ?? "Mise à jour impossible");
        setOptimistic((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        return;
      }
      toast.success("Statut mis à jour");
      startTransition(() => router.refresh());
    } catch (error) {
      console.error(error);
      toast.error("Erreur réseau");
    }
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 bg-card/40 p-12 text-center text-sm text-muted-foreground">
        Aucune commande pour le moment.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-card/60">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Référence</th>
              <th className="px-5 py-3">Client</th>
              <th className="px-5 py-3">Articles</th>
              <th className="px-5 py-3 text-right">Total</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {orders.map((order) => {
              const status = (optimistic[order.id] ?? order.status) as OrderStatus;
              return (
                <tr key={order.id} className="transition hover:bg-white/5">
                  <td className="px-5 py-4">
                    <p className="font-mono text-xs text-muted-foreground">{order.reference}</p>
                    <Badge variant="outline" className="mt-1">
                      {order.channel === "WHATSAPP" ? "WhatsApp" : "Chat"}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                  </td>
                  <td className="px-5 py-4">
                    <ul className="space-y-0.5 text-xs">
                      {order.items.slice(0, 3).map((item, index) => (
                        <li key={index} className="text-muted-foreground">
                          {item.quantity} × {item.nameSnapshot}
                        </li>
                      ))}
                      {order.items.length > 3 && (
                        <li className="text-xs text-muted-foreground">
                          +{order.items.length - 3} autres
                        </li>
                      )}
                    </ul>
                  </td>
                  <td className="px-5 py-4 text-right font-display text-sm font-semibold">
                    {formatXOF(order.total)}
                  </td>
                  <td className="px-5 py-4 text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Badge variant={statusVariant[status] ?? "muted"}>
                        {ORDER_STATUS_LABELS[status]}
                      </Badge>
                      <Select
                        value={status}
                        onValueChange={(value) =>
                          handleStatusChange(order.id, value as OrderStatus)
                        }
                        disabled={pending}
                      >
                        <SelectTrigger className="h-8 w-32 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ORDER_STATUSES.map((value) => (
                            <SelectItem key={value} value={value}>
                              {ORDER_STATUS_LABELS[value]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
