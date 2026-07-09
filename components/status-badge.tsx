import type { BookingStatus } from "@prisma/client";
import { BOOKING_STATUS_LABEL, BOOKING_STATUS_TONE } from "@/lib/format";
import { cn } from "@/lib/utils";

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        BOOKING_STATUS_TONE[status]
      )}
    >
      {BOOKING_STATUS_LABEL[status]}
    </span>
  );
}
