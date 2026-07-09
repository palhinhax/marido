import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, MapPin, User } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookingStatusBadge } from "@/components/status-badge";
import { BookingTimeline } from "@/components/booking-timeline";
import { BookingDetailActions } from "@/features/client/components/booking-detail-actions";
import {
  priceLabel,
  formatDateTime,
  URGENCY_LABEL,
  PROPERTY_TYPE_LABEL,
  durationLabel,
} from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ClientBookingDetail({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireUser(["CLIENT"]);
  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      service: true,
      professional: { select: { displayName: true, slug: true, phone: true } },
      statusHistory: { orderBy: { createdAt: "desc" } },
      review: true,
    },
  });

  if (
    !booking ||
    (booking.clientId !== user.id && booking.clientEmail !== user.email)
  )
    notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/dashboard/pedidos"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="mr-1 h-4 w-4" /> Voltar aos pedidos
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{booking.service.name}</h1>
            <BookingStatusBadge status={booking.status} />
          </div>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            {booking.reference}
          </p>
        </div>
        <p className="text-2xl font-bold text-primary">
          {priceLabel(booking.estimatedPrice, booking.priceType)}
        </p>
      </div>

      <div className="grid gap-3 rounded-xl border bg-card p-5 text-sm sm:grid-cols-2">
        <Row
          label="Data"
          value={
            booking.scheduledStart
              ? formatDateTime(booking.scheduledStart)
              : "A combinar"
          }
        />
        <Row
          label="Duração estimada"
          value={durationLabel(booking.service.estimatedDurationMinutes)}
        />
        <Row label="Urgência" value={URGENCY_LABEL[booking.urgency]} />
        <Row
          label="Tipo de imóvel"
          value={PROPERTY_TYPE_LABEL[booking.propertyType]}
        />
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold">Local</h2>
        <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {booking.address}, {booking.postalCode} {booking.city}
            <br />
            {booking.municipality}, {booking.district}
          </span>
        </p>
        {booking.accessNotes && (
          <p className="mt-2 text-sm text-muted-foreground">
            Acesso: {booking.accessNotes}
          </p>
        )}
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold">O que pediu</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {booking.clientDescription}
        </p>
      </div>

      {booking.professional && (
        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold">Profissional</h2>
          <div className="mt-2 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-primary" />{" "}
              {booking.professional.displayName}
            </span>
            <Link
              href={`/profissionais/${booking.professional.slug}`}
              className="text-sm text-primary hover:underline"
            >
              Ver perfil
            </Link>
          </div>
        </div>
      )}

      <BookingDetailActions
        bookingId={booking.id}
        status={booking.status}
        hasReview={!!booking.review}
      />

      <div className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold">Histórico</h2>
        <div className="mt-4">
          <BookingTimeline history={booking.statusHistory} />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
