import { prisma } from "@/lib/prisma";
import { BookingStatusBadge } from "@/components/status-badge";
import { euros, formatDateTime } from "@/lib/format";
import type { BookingStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const FILTERS: { label: string; value: string }[] = [
  { label: "Todos", value: "all" },
  { label: "Pendentes", value: "PENDING" },
  { label: "Aceites", value: "ACCEPTED" },
  { label: "Concluídos", value: "COMPLETED" },
  { label: "Cancelados", value: "CANCELLED" },
];

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: { estado?: string };
}) {
  const estado = searchParams.estado ?? "all";
  const where = estado !== "all" ? { status: estado as BookingStatus } : {};

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      service: { select: { name: true } },
      professional: { select: { displayName: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <p className="text-muted-foreground">Todos os pedidos da plataforma.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <a
            key={f.value}
            href={`/admin/pedidos?estado=${f.value}`}
            className={`rounded-full border px-3 py-1 text-sm ${
              estado === f.value
                ? "border-primary bg-primary/5 text-primary"
                : "hover:bg-muted"
            }`}
          >
            {f.label}
          </a>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3">Ref.</th>
              <th className="p-3">Serviço</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Profissional</th>
              <th className="p-3">Local</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Criado</th>
              <th className="p-3 text-right">Preço</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b last:border-0">
                <td className="p-3 font-mono text-xs">{b.reference}</td>
                <td className="p-3">{b.service.name}</td>
                <td className="p-3 text-muted-foreground">{b.clientName}</td>
                <td className="p-3 text-muted-foreground">
                  {b.professional?.displayName ?? "—"}
                </td>
                <td className="p-3 text-muted-foreground">{b.municipality}</td>
                <td className="p-3">
                  <BookingStatusBadge status={b.status} />
                </td>
                <td className="p-3 text-muted-foreground">
                  {formatDateTime(b.createdAt)}
                </td>
                <td className="p-3 text-right">
                  {b.estimatedPrice ? euros(b.estimatedPrice) : "—"}
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="p-8 text-center text-muted-foreground"
                >
                  Sem pedidos neste filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
