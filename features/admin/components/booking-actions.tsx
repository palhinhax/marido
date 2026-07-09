"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import type { BookingStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { BOOKING_STATUS_LABEL } from "@/lib/format";
import { adminUpdateBookingStatus, deleteBooking } from "../actions";

// Operational statuses an admin sets manually (DRAFT / RESCHEDULE_REQUESTED are
// system-driven and left out of the picker).
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

export function AdminBookingActions({
  bookingId,
  status,
  redirectToList = false,
}: {
  bookingId: string;
  status: BookingStatus;
  redirectToList?: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [next, setNext] = useState<BookingStatus>(status);
  const [note, setNote] = useState("");

  const unchanged = next === status && note.trim() === "";

  function save() {
    start(async () => {
      try {
        await adminUpdateBookingStatus(bookingId, next, note || undefined);
        toast({ title: "Estado atualizado" });
        setNote("");
        router.refresh();
      } catch (e) {
        toast({
          title: "Erro",
          description: (e as Error).message,
          variant: "destructive",
        });
      }
    });
  }

  function remove() {
    start(async () => {
      try {
        await deleteBooking(bookingId);
        toast({ title: "Pedido eliminado" });
        if (redirectToList) {
          router.push("/admin/pedidos");
        } else {
          router.refresh();
        }
      } catch (e) {
        toast({
          title: "Erro",
          description: (e as Error).message,
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 lg:flex-row lg:items-end">
      <label className="flex flex-1 flex-col gap-1 text-sm">
        <span className="font-medium">Estado</span>
        <select
          value={next}
          onChange={(e) => setNext(e.target.value as BookingStatus)}
          className="h-10 rounded-md border bg-background px-3 text-sm"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {BOOKING_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-[2] flex-col gap-1 text-sm">
        <span className="font-medium">Nota (opcional)</span>
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Motivo ou observação para o histórico"
          className="h-10"
        />
      </label>
      <Button onClick={save} disabled={pending || unchanged}>
        {pending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
        Atualizar estado
      </Button>
      <Button
        variant="outline"
        className="text-destructive hover:bg-destructive/10"
        disabled={pending}
        onClick={() => {
          if (
            confirm("Eliminar este pedido? Esta ação não pode ser anulada.")
          ) {
            remove();
          }
        }}
      >
        <Trash2 className="mr-1 h-4 w-4" /> Eliminar
      </Button>
    </div>
  );
}
