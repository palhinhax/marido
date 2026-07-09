import type { BookingStatus } from "@prisma/client";
import { BOOKING_STATUS_LABEL } from "@/lib/format";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export function BookingTimeline({
  history,
}: {
  history: {
    status: BookingStatus;
    note: string | null;
    createdAt: Date | string;
  }[];
}) {
  if (!history.length) return null;
  return (
    <ol className="space-y-4">
      {history.map((h, i) => (
        <li key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className={cn(
                "mt-1 h-2.5 w-2.5 rounded-full",
                i === 0 ? "bg-primary" : "bg-muted-foreground/40"
              )}
            />
            {i < history.length - 1 && (
              <span className="w-px flex-1 bg-border" />
            )}
          </div>
          <div className="pb-1">
            <p className="text-sm font-medium">
              {BOOKING_STATUS_LABEL[h.status]}
            </p>
            {h.note && (
              <p className="text-sm text-muted-foreground">{h.note}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {formatDateTime(h.createdAt)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
