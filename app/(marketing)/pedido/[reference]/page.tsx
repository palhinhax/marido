import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Clock, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "@/components/status-badge";
import { prisma } from "@/lib/prisma";
import { priceLabel, formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pedido submetido",
  robots: { index: false },
};

export default async function BookingConfirmationPage({
  params,
}: {
  params: { reference: string };
}) {
  const booking = await prisma.booking.findUnique({
    where: { reference: params.reference },
    include: {
      service: { select: { name: true } },
      professional: { select: { displayName: true } },
    },
  });

  if (!booking) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="rounded-2xl border bg-card p-6 text-center sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">Pedido submetido!</h1>
        <p className="mt-2 text-muted-foreground">
          O seu pedido <strong>{booking.reference}</strong> foi enviado. Um
          profissional irá analisar e responder em breve. Enviámos os detalhes
          para {booking.clientEmail}.
        </p>
        <div className="mt-4 flex justify-center">
          <BookingStatusBadge status={booking.status} />
        </div>

        <div className="mt-6 space-y-3 rounded-xl border bg-background p-5 text-left text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium">{booking.service.name}</span>
            <span className="font-semibold text-primary">
              {priceLabel(booking.estimatedPrice, booking.priceType)}
            </span>
          </div>
          <p className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" /> {booking.address}, {booking.city} (
            {booking.municipality})
          </p>
          <p className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />{" "}
            {booking.scheduledStart
              ? formatDateTime(booking.scheduledStart)
              : "Horário a combinar"}
          </p>
          {booking.professional && (
            <p className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" /> Profissional:{" "}
              {booking.professional.displayName}
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link href="/dashboard/pedidos">
            <Button className="w-full sm:w-auto">Ver os meus pedidos</Button>
          </Link>
          <Link href="/servicos">
            <Button variant="outline" className="w-full sm:w-auto">
              Marcar outro serviço
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Para acompanhar o pedido, crie conta com o email {booking.clientEmail}{" "}
          caso ainda não o tenha feito.
        </p>
      </div>
    </div>
  );
}
