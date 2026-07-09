import { prisma } from "@/lib/prisma";
import { SpecialRequestsTable } from "@/components/admin/special-requests-table";

export const dynamic = "force-dynamic";

export default async function AdminSpecialRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const query = (await searchParams).q;

  const requests = await prisma.specialRequest.findMany({
    where: query
      ? {
          OR: [
            { reference: { contains: query } },
            { customerName: { contains: query } },
            { productUrl: { contains: query } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Demandes spéciales</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Importations sur mesure depuis Alibaba, Amazon et autres.
        </p>
      </header>

      <SpecialRequestsTable requests={requests} />
    </div>
  );
}
