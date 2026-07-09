import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentProfessional } from "@/features/professional/queries";
import { BookingStatusBadge } from "@/components/status-badge";
import { BookingTimeline } from "@/components/booking-timeline";
import { BookingActions } from "@/features/professional/components/booking-actions";
import {
  priceLabel,
  formatDateTime,
  URGENCY_LABEL,
  PROPERTY_TYPE_LABEL,
  durationLabel,
} from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProfessionalBookingDetail({
  params,
}: {
  params: { id: string };
}) {
  const pro = await getCurrentProfessional();
  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      service: true,
      photos: true,
      statusHistory: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!booking || (booking.professionalId && booking.professionalId !== pro.id))
    notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href="/profissional/pedidos"
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

      <div className="flex flex-wrap gap-2">
        <BookingActions
          bookingId={booking.id}
          status={booking.status}
          size="default"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold">Detalhes do trabalho</h2>
          <dl className="mt-3 space-y-2 text-sm">
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
          </dl>
          <div className="mt-4">
            <p className="text-sm font-medium">Descrição do cliente</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {booking.clientDescription}
            </p>
          </div>
          {booking.photos.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {booking.photos.map((p) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={p.id}
                  src={p.url}
                  alt=""
                  className="h-20 w-20 rounded-md object-cover"
                />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-6">
          <div className="rounded-xl border bg-card p-5">
            <h2 className="font-semibold">Local</h2>
            <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {booking.address}
                <br />
                {booking.postalCode} {booking.city}
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
            <h2 className="font-semibold">Contacto do cliente</h2>
            <p className="mt-2 text-sm font-medium">{booking.clientName}</p>
            <div className="mt-3 flex flex-col gap-2">
              <a
                href={`tel:${booking.clientPhone}`}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Phone className="h-4 w-4" /> {booking.clientPhone}
              </a>
              <a
                href={`mailto:${booking.clientEmail}`}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Mail className="h-4 w-4" /> {booking.clientEmail}
              </a>
              {booking.whatsappConsent && (
                <a
                  href={`https://wa.me/351${booking.clientPhone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              )}
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold">Histórico</h2>
        <div className="mt-4">
          <BookingTimeline history={booking.statusHistory} />
        </div>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
