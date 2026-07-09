import { prisma } from "@/lib/prisma";
import {
  getCurrentProfessional,
  getClaimableBookings,
} from "@/features/professional/queries";
import { BookingCard } from "@/components/booking-card";
import { BookingActions } from "@/features/professional/components/booking-actions";
import { ClaimButton } from "@/features/professional/components/claim-button";
import { EmptyState } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import type { BookingStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const GROUPS: { title: string; statuses: BookingStatus[] }[] = [
  { title: "Pendentes", statuses: ["PENDING"] },
  {
    title: "Aceites e agendados",
    statuses: ["ACCEPTED", "SCHEDULED", "IN_PROGRESS"],
  },
  { title: "Concluídos", statuses: ["COMPLETED"] },
  {
    title: "Outros",
    statuses: ["REJECTED", "CANCELLED", "NO_SHOW", "RESCHEDULE_REQUESTED"],
  },
];

export default async function ProfessionalBookingsPage() {
  const pro = await getCurrentProfessional();
  const [bookings, claimable] = await Promise.all([
    prisma.booking.findMany({
      where: { professionalId: pro.id },
      include: { service: { select: { name: true } } },
      orderBy: [
        { status: "asc" },
        { scheduledStart: "asc" },
        { createdAt: "desc" },
      ],
    }),
    pro.approvalStatus === "APPROVED" ? getClaimableBookings(pro.id, 20) : [],
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <p className="text-muted-foreground">
          Aceite, recuse e acompanhe os seus trabalhos.
        </p>
      </div>

      {bookings.length === 0 && claimable.length === 0 && (
        <EmptyState
          title="Ainda não tem pedidos"
          description="Assim que houver pedidos na sua zona e serviços, aparecem aqui."
        />
      )}

      {/* Unassigned requests the professional can claim */}
      {claimable.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-lg font-semibold">Disponíveis na sua zona</h2>
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

      {GROUPS.map((g) => {
        const items = bookings.filter((b) => g.statuses.includes(b.status));
        if (items.length === 0) return null;
        return (
          <section key={g.title}>
            <h2 className="mb-3 text-lg font-semibold">
              {g.title}{" "}
              <span className="text-sm text-muted-foreground">
                ({items.length})
              </span>
            </h2>
            <div className="space-y-3">
              {items.map((b) => (
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
                  actions={
                    <BookingActions bookingId={b.id} status={b.status} />
                  }
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
