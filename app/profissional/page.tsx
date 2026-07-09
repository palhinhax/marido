import Link from "next/link";
import {
  ClipboardList,
  CalendarDays,
  CheckCircle2,
  Wallet,
  Star,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  getCurrentProfessional,
  getProfileCompletion,
  getClaimableBookings,
} from "@/features/professional/queries";
import { StatCard, EmptyState } from "@/components/dashboard/stat-card";
import { BookingCard } from "@/components/booking-card";
import { BookingActions } from "@/features/professional/components/booking-actions";
import { ClaimButton } from "@/features/professional/components/claim-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { euros } from "@/lib/format";

export const dynamic = "force-dynamic";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

export default async function ProfessionalDashboard() {
  const pro = await getCurrentProfessional();
  const completion = await getProfileCompletion(pro.id);

  const [pending, today, upcoming, completedCount, earnings, reviewsCount] =
    await Promise.all([
      prisma.booking.findMany({
        where: { professionalId: pro.id, status: "PENDING" },
        include: { service: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.booking.findMany({
        where: {
          professionalId: pro.id,
          status: { in: ["ACCEPTED", "SCHEDULED", "IN_PROGRESS"] },
          scheduledStart: { gte: startOfToday(), lte: endOfToday() },
        },
        include: { service: { select: { name: true } } },
        orderBy: { scheduledStart: "asc" },
      }),
      prisma.booking.findMany({
        where: {
          professionalId: pro.id,
          status: { in: ["ACCEPTED", "SCHEDULED"] },
          scheduledStart: { gt: endOfToday() },
        },
        include: { service: { select: { name: true } } },
        orderBy: { scheduledStart: "asc" },
        take: 5,
      }),
      prisma.booking.count({
        where: { professionalId: pro.id, status: "COMPLETED" },
      }),
      prisma.booking.aggregate({
        where: { professionalId: pro.id, status: "COMPLETED" },
        _sum: { estimatedPrice: true },
      }),
      prisma.review.count({ where: { professionalId: pro.id } }),
    ]);

  const notApproved = pro.approvalStatus !== "APPROVED";
  // Unassigned requests this professional can claim (only when approved).
  const claimable = notApproved ? [] : await getClaimableBookings(pro.id, 6);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Olá, {pro.displayName}</h1>
        <p className="text-muted-foreground">
          Aqui está o resumo da sua atividade.
        </p>
      </div>

      {notApproved && (
        <div className="flex items-start gap-3 rounded-xl border border-warm/30 bg-warm/10 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 text-warm" />
          <div>
            <p className="font-medium">Conta em análise</p>
            <p className="text-sm text-muted-foreground">
              O seu perfil está pendente de aprovação. Complete o perfil para
              acelerar o processo. Só receberá pedidos após aprovação.
            </p>
            <Link href="/profissional/onboarding" className="mt-2 inline-block">
              <Button size="sm" variant="outline">
                Completar perfil
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Pedidos pendentes"
          value={pending.length}
          icon={ClipboardList}
          tone="warm"
        />
        <StatCard
          label="Trabalhos hoje"
          value={today.length}
          icon={CalendarDays}
        />
        <StatCard
          label="Concluídos"
          value={completedCount}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Ganhos estimados"
          value={euros(earnings._sum.estimatedPrice ?? 0)}
          icon={Wallet}
          hint="Com base nos serviços concluídos"
        />
      </div>

      {/* Claimable requests — unassigned, in this professional's zone */}
      {claimable.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Pedidos disponíveis na sua zona
              </h2>
              <p className="text-sm text-muted-foreground">
                Pedidos sem profissional atribuído que correspondem aos seus
                serviços e áreas. Seja o primeiro a aceitar.
              </p>
            </div>
            <Badge variant="warm">{claimable.length}</Badge>
          </div>
          <div className="space-y-3">
            {claimable.map((b) => (
              <BookingCard
                key={b.id}
                booking={{
                  id: b.id,
                  reference: b.reference,
                  status: b.status,
                  serviceName: b.service.name,
                  city: b.city,
                  municipality: b.municipality,
                  scheduledStart: b.scheduledStart,
                  estimatedPrice: b.estimatedPrice,
                  priceType: b.priceType,
                  urgency: b.urgency,
                }}
                actions={<ClaimButton bookingId={b.id} />}
              />
            ))}
          </div>
        </section>
      )}

      {/* Profile completion */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">
            Perfil {completion.percent}% completo
          </h2>
          <Badge variant={completion.percent === 100 ? "success" : "warm"}>
            {completion.done}/{completion.total}
          </Badge>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${completion.percent}%` }}
          />
        </div>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {completion.checks.map((c) => (
            <li key={c.label} className="flex items-center gap-2 text-sm">
              <CheckCircle2
                className={
                  c.done
                    ? "h-4 w-4 text-success"
                    : "h-4 w-4 text-muted-foreground/40"
                }
              />
              <span className={c.done ? "" : "text-muted-foreground"}>
                {c.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Pending requests */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Pedidos pendentes</h2>
          <Link
            href="/profissional/pedidos"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Ver todos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {pending.length === 0 ? (
          <EmptyState
            title="Sem pedidos pendentes"
            description="Novos pedidos na sua zona aparecem aqui."
          />
        ) : (
          <div className="space-y-3">
            {pending.map((b) => (
              <BookingCard
                key={b.id}
                href={`/profissional/pedidos/${b.id}`}
                booking={{
                  id: b.id,
                  reference: b.reference,
                  status: b.status,
                  serviceName: b.service.name,
                  city: b.city,
                  municipality: b.municipality,
                  scheduledStart: b.scheduledStart,
                  estimatedPrice: b.estimatedPrice,
                  priceType: b.priceType,
                  urgency: b.urgency,
                  counterpartName: b.clientName,
                }}
                actions={<BookingActions bookingId={b.id} status={b.status} />}
              />
            ))}
          </div>
        )}
      </section>

      {/* Today + upcoming */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Trabalhos de hoje</h2>
        {today.length === 0 ? (
          <EmptyState title="Nada agendado para hoje" />
        ) : (
          <div className="space-y-3">
            {today.map((b) => (
              <BookingCard
                key={b.id}
                href={`/profissional/pedidos/${b.id}`}
                booking={{
                  id: b.id,
                  reference: b.reference,
                  status: b.status,
                  serviceName: b.service.name,
                  city: b.city,
                  municipality: b.municipality,
                  scheduledStart: b.scheduledStart,
                  estimatedPrice: b.estimatedPrice,
                  priceType: b.priceType,
                  urgency: b.urgency,
                  counterpartName: b.clientName,
                }}
                actions={<BookingActions bookingId={b.id} status={b.status} />}
              />
            ))}
          </div>
        )}
      </section>

      {upcoming.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Próximos trabalhos</h2>
          <div className="space-y-3">
            {upcoming.map((b) => (
              <BookingCard
                key={b.id}
                href={`/profissional/pedidos/${b.id}`}
                booking={{
                  id: b.id,
                  reference: b.reference,
                  status: b.status,
                  serviceName: b.service.name,
                  city: b.city,
                  municipality: b.municipality,
                  scheduledStart: b.scheduledStart,
                  estimatedPrice: b.estimatedPrice,
                  priceType: b.priceType,
                  urgency: b.urgency,
                  counterpartName: b.clientName,
                }}
              />
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-wrap gap-3">
        <Link href="/profissional/disponibilidade">
          <Button variant="outline">
            <CalendarDays className="mr-2 h-4 w-4" /> Gerir disponibilidade
          </Button>
        </Link>
        <Link href="/profissional/avaliacoes">
          <Button variant="outline">
            <Star className="mr-2 h-4 w-4" /> {reviewsCount} avaliações
          </Button>
        </Link>
      </div>
    </div>
  );
}
