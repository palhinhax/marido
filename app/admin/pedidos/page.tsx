import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";
import type { BookingStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { BookingStatusBadge } from "@/components/status-badge";
import { AdminBookingRowActions } from "@/features/admin/components/booking-row-actions";
import { euros, formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

const FILTERS: { label: string; value: string }[] = [
  { label: "Todos", value: "all" },
  { label: "Pendentes", value: "PENDING" },
  { label: "Aceites", value: "ACCEPTED" },
  { label: "Agendados", value: "SCHEDULED" },
  { label: "Em curso", value: "IN_PROGRESS" },
  { label: "Concluídos", value: "COMPLETED" },
  { label: "Cancelados", value: "CANCELLED" },
];

const PAGE_SIZE = 25;

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: { estado?: string; q?: string; page?: string };
}) {
  const estado = searchParams.estado ?? "all";
  const q = (searchParams.q ?? "").trim();
  const page = Math.max(1, Number(searchParams.page) || 1);

  const where: Prisma.BookingWhereInput = {
    ...(estado !== "all" ? { status: estado as BookingStatus } : {}),
    ...(q
      ? {
          OR: [
            { reference: { contains: q, mode: "insensitive" } },
            { clientName: { contains: q, mode: "insensitive" } },
            { clientEmail: { contains: q, mode: "insensitive" } },
            { municipality: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [total, bookings] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.findMany({
      where,
      include: {
        service: { select: { name: true } },
        professional: { select: { displayName: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildHref = (params: {
    estado?: string;
    q?: string;
    page?: number;
  }) => {
    const merged = { estado, q, page, ...params };
    const sp = new URLSearchParams();
    if (merged.estado && merged.estado !== "all")
      sp.set("estado", merged.estado);
    if (merged.q) sp.set("q", merged.q);
    if (merged.page && merged.page > 1) sp.set("page", String(merged.page));
    const s = sp.toString();
    return `/admin/pedidos${s ? `?${s}` : ""}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <p className="text-muted-foreground">
          {total} {total === 1 ? "pedido" : "pedidos"}
          {estado !== "all" || q ? " (filtrados)" : " na plataforma"}.
        </p>
      </div>

      {/* Search */}
      <form method="get" className="flex gap-2">
        {estado !== "all" && (
          <input type="hidden" name="estado" value={estado} />
        )}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Procurar por referência, cliente, email ou concelho"
            className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm"
          />
        </div>
        <button className="h-10 rounded-md border bg-card px-4 text-sm font-medium hover:bg-muted">
          Procurar
        </button>
      </form>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={buildHref({ estado: f.value, page: 1 })}
            className={`rounded-full border px-3 py-1 text-sm ${
              estado === f.value
                ? "border-primary bg-primary/5 text-primary"
                : "hover:bg-muted"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[820px] text-sm">
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
              <th className="p-3 text-right">AÃ§Ãµes</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr
                key={b.id}
                className="border-b transition-colors last:border-0 hover:bg-muted/40"
              >
                <td className="p-3">
                  <Link
                    href={`/admin/pedidos/${b.id}`}
                    className="font-mono text-xs text-primary hover:underline"
                  >
                    {b.reference}
                  </Link>
                </td>
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
                <td className="p-3">
                  <div className="flex items-center justify-end gap-3">
                    <AdminBookingRowActions
                      bookingId={b.id}
                      status={b.status}
                    />
                    <Link
                      href={`/admin/pedidos/${b.id}`}
                      className="inline-flex items-center whitespace-nowrap text-primary hover:underline"
                    >
                      Ver <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="p-8 text-center text-muted-foreground"
                >
                  Sem pedidos neste filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={buildHref({ page: page - 1 })}
                className="rounded-md border bg-card px-3 py-1.5 text-sm hover:bg-muted"
              >
                Anterior
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={buildHref({ page: page + 1 })}
                className="rounded-md border bg-card px-3 py-1.5 text-sm hover:bg-muted"
              >
                Seguinte
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
