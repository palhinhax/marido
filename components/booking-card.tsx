import Link from "next/link";
import { MapPin, Clock, User } from "lucide-react";
import type { BookingStatus, PriceType } from "@prisma/client";
import { BookingStatusBadge } from "@/components/status-badge";
import { priceLabel, formatDateTime, URGENCY_LABEL } from "@/lib/format";
import type { Urgency } from "@prisma/client";

export interface BookingCardData {
  id: string;
  reference: string;
  status: BookingStatus;
  serviceName: string;
  city: string;
  municipality: string;
  scheduledStart: Date | string | null;
  estimatedPrice: number | null;
  priceType: PriceType;
  urgency: Urgency;
  counterpartName?: string | null;
}

export function BookingCard({
  booking,
  href,
  actions,
}: {
  booking: BookingCardData;
  href?: string;
  actions?: React.ReactNode;
}) {
  const inner = (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/30 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">{booking.serviceName}</span>
          <BookingStatusBadge status={booking.status} />
          {booking.urgency !== "NORMAL" && (
            <span className="rounded-full bg-warm/10 px-2 py-0.5 text-xs font-medium text-warm">
              {URGENCY_LABEL[booking.urgency]}
            </span>
          )}
        </div>
        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {booking.municipality}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {booking.scheduledStart
              ? formatDateTime(booking.scheduledStart)
              : "A combinar"}
          </span>
          {booking.counterpartName && (
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" /> {booking.counterpartName}
            </span>
          )}
          <span className="font-mono text-xs">{booking.reference}</span>
        </div>
      </div>
      <div className="flex items-center gap-3 sm:flex-col sm:items-end">
        <span className="font-semibold text-primary">
          {priceLabel(booking.estimatedPrice, booking.priceType)}
        </span>
        {actions}
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}
