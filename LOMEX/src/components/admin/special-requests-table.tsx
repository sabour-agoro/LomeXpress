"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SPECIAL_REQUEST_STATUSES,
  SPECIAL_REQUEST_STATUS_LABELS,
  type SpecialRequestStatus,
} from "@/lib/enums";

type RequestRow = {
  id: string;
  reference: string;
  status: string;
  productUrl: string;
  description: string | null;
  customerName: string;
  customerPhone: string;
  quantity: number;
  createdAt: Date;
};

const variants: Record<string, "warning" | "accent" | "success" | "muted" | "default"> = {
  PENDING: "warning",
  QUOTED: "accent",
  CONFIRMED: "default",
  DELIVERED: "success",
  CANCELLED: "muted",
};

export function SpecialRequestsTable({ requests }: { requests: RequestRow[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState<Record<string, string>>({});

  async function handleStatusChange(id: string, status: SpecialRequestStatus) {
    setOptimistic((prev) => ({ ...prev, [id]: status }));
    try {
      const response = await fetch(`/api/admin/special-requests/${id}`, {
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

  if (requests.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 bg-card/40 p-12 text-center text-sm text-muted-foreground">
        Aucune demande pour le moment.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-card/60">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Réf.</th>
              <th className="px-5 py-3">Client</th>
              <th className="px-5 py-3">Produit</th>
              <th className="px-5 py-3 text-right">Qté</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {requests.map((request) => {
              const status = (optimistic[request.id] ?? request.status) as SpecialRequestStatus;
              return (
                <tr key={request.id} className="transition hover:bg-white/5">
                  <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
                    {request.reference}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium">{request.customerName}</p>
                    <p className="text-xs text-muted-foreground">{request.customerPhone}</p>
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={request.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex max-w-xs items-center gap-1 truncate text-xs text-brand-300 hover:underline"
                    >
                      {request.productUrl}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                    {request.description && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {request.description}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">{request.quantity}</td>
                  <td className="px-5 py-4 text-xs text-muted-foreground">
                    {new Date(request.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Badge variant={variants[status] ?? "muted"}>
                        {SPECIAL_REQUEST_STATUS_LABELS[status]}
                      </Badge>
                      <Select
                        value={status}
                        onValueChange={(value) =>
                          handleStatusChange(request.id, value as SpecialRequestStatus)
                        }
                      >
                        <SelectTrigger className="h-8 w-32 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SPECIAL_REQUEST_STATUSES.map((value) => (
                            <SelectItem key={value} value={value}>
                              {SPECIAL_REQUEST_STATUS_LABELS[value]}
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
