import Link from "next/link";
import {
  Users,
  ShieldCheck,
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  Star,
  AlertCircle,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/dashboard/stat-card";
import { BookingStatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { euros, formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [
    totalUsers,
    totalPros,
    pendingPros,
    totalBookings,
    pendingBookings,
    completedBookings,
    cancelledBookings,
    revenue,
    pendingReviews,
    recentBookings,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.professionalProfile.count(),
    prisma.professionalProfile.count({ where: { approvalStatus: "PENDING" } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.booking.count({ where: { status: "COMPLETED" } }),
    prisma.booking.count({
      where: { status: { in: ["CANCELLED", "REJECTED", "NO_SHOW"] } },
    }),
    prisma.booking.aggregate({
      where: { status: "COMPLETED" },
      _sum: { estimatedPrice: true },
    }),
    prisma.review.count({ where: { isApproved: false } }),
    prisma.booking.findMany({
      include: { service: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Painel de administração</h1>
        <p className="text-muted-foreground">Visão geral da plataforma.</p>
      </div>

      {pendingPros > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-warm/30 bg-warm/10 p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-warm" />
            <p className="text-sm">
              <strong>{pendingPros}</strong> profissionais a aguardar aprovação.
            </p>
          </div>
          <Link href="/admin/profissionais">
            <Button size="sm">Rever</Button>
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Utilizadores" value={totalUsers} icon={Users} />
        <StatCard
          label="Profissionais"
          value={totalPros}
          icon={ShieldCheck}
          hint={`${pendingPros} pendentes`}
        />
        <StatCard
          label="Total de pedidos"
          value={totalBookings}
          icon={ClipboardList}
        />
        <StatCard
          label="Pendentes"
          value={pendingBookings}
          icon={Clock}
          tone="warm"
        />
        <StatCard
          label="Concluídos"
          value={completedBookings}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard label="Cancelados" value={cancelledBookings} icon={XCircle} />
        <StatCard
          label="Volume (concluídos)"
          value={euros(revenue._sum.estimatedPrice ?? 0)}
          icon={CheckCircle2}
        />
        <StatCard
          label="Avaliações por moderar"
          value={pendingReviews}
          icon={Star}
          tone="warm"
        />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Pedidos recentes</h2>
          <Link
            href="/admin/pedidos"
            className="text-sm text-primary hover:underline"
          >
            Ver todos
          </Link>
        </div>
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[600px] text-sm">
            <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-3">Ref.</th>
                <th className="p-3">Serviço</th>
                <th className="p-3">Local</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Data</th>
                <th className="p-3 text-right">Preço</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((b) => (
                <tr key={b.id} className="border-b last:border-0">
                  <td className="p-3 font-mono text-xs">{b.reference}</td>
                  <td className="p-3">{b.service.name}</td>
                  <td className="p-3 text-muted-foreground">
                    {b.municipality}
                  </td>
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
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
