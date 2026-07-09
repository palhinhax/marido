"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Trash2 } from "lucide-react";
import type { BookingStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/use-toast";
import { BOOKING_STATUS_LABEL } from "@/lib/format";
import { adminUpdateBookingStatus, deleteBooking } from "../actions";

const STATUS_OPTIONS: BookingStatus[] = [
  "PENDING",
  "ACCEPTED",
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
  "REJECTED",
];

export function AdminBookingRowActions({
  bookingId,
  status,
}: {
  bookingId: string;
  status: BookingStatus;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [next, setNext] = useState<BookingStatus>(status);

  const run = (fn: () => Promise<unknown>, msg: string) =>
    start(async () => {
      try {
        await fn();
        toast({ title: msg });
        router.refresh();
      } catch (e) {
        toast({
          title: "Erro",
          description: (e as Error).message,
          variant: "destructive",
        });
      }
    });

  return (
    <div className="flex items-center justify-end gap-2">
      <select
        value={next}
        onChange={(e) => setNext(e.target.value as BookingStatus)}
        disabled={pending}
        className="h-8 rounded-md border bg-background px-2 text-xs"
        aria-label="Estado do pedido"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {BOOKING_STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      <Button
        size="sm"
        variant="ghost"
        disabled={pending || next === status}
        onClick={() =>
          run(
            () =>
              adminUpdateBookingStatus(
                bookingId,
                next,
                "Atualizado pela administração"
              ),
            "Estado atualizado"
          )
        }
        aria-label="Guardar estado"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Check className="h-4 w-4" />
        )}
      </Button>
      <ConfirmDialog
        title="Eliminar este pedido?"
        description="Esta ação não pode ser anulada."
        confirmLabel="Eliminar"
        destructive
        onConfirm={async () => {
          try {
            await deleteBooking(bookingId);
            toast({ title: "Pedido eliminado" });
            router.refresh();
          } catch (e) {
            toast({
              title: "Erro",
              description: (e as Error).message,
              variant: "destructive",
            });
          }
        }}
        trigger={
          <Button
            size="sm"
            variant="outline"
            className="text-destructive hover:bg-destructive/10"
            disabled={pending}
            aria-label="Eliminar pedido"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        }
      />
    </div>
  );
}
