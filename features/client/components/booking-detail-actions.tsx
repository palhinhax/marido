"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, XCircle, Star, Loader2 } from "lucide-react";
import type { BookingStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { cancelBooking, requestReschedule, submitReview } from "../actions";

export function BookingDetailActions({
  bookingId,
  status,
  hasReview,
}: {
  bookingId: string;
  status: BookingStatus;
  hasReview: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleNote, setRescheduleNote] = useState("");

  const cancellable = [
    "PENDING",
    "ACCEPTED",
    "SCHEDULED",
    "RESCHEDULE_REQUESTED",
  ].includes(status);
  const reschedulable = ["PENDING", "ACCEPTED", "SCHEDULED"].includes(status);
  const reviewable = status === "COMPLETED" && !hasReview;

  async function run(
    key: string,
    fn: () => Promise<unknown>,
    successMsg: string
  ) {
    setBusy(key);
    try {
      await fn();
      toast({ title: successMsg });
      router.refresh();
    } catch (e) {
      toast({
        title: "Erro",
        description: (e as Error).message,
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  }

  if (!cancellable && !reschedulable && !reviewable) return null;

  return (
    <div className="space-y-4">
      {(cancellable || reschedulable) && (
        <div className="flex flex-wrap gap-2">
          {reschedulable && (
            <Button
              variant="outline"
              onClick={() => setRescheduleOpen((v) => !v)}
            >
              <CalendarClock className="mr-2 h-4 w-4" /> Pedir reagendamento
            </Button>
          )}
          {cancellable && (
            <ConfirmDialog
              title="Cancelar este pedido?"
              description="Esta ação não pode ser anulada. O profissional será avisado de que o pedido foi cancelado."
              confirmLabel="Cancelar pedido"
              cancelLabel="Voltar"
              destructive
              onConfirm={() =>
                run(
                  "cancel",
                  () => cancelBooking(bookingId),
                  "Pedido cancelado"
                )
              }
              trigger={
                <Button
                  variant="outline"
                  className="text-destructive hover:bg-destructive/10"
                  disabled={busy === "cancel"}
                >
                  {busy === "cancel" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="mr-2 h-4 w-4" />
                  )}
                  Cancelar pedido
                </Button>
              }
            />
          )}
        </div>
      )}

      {rescheduleOpen && reschedulable && (
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm font-medium">Pedir reagendamento</p>
          <Textarea
            className="mt-2"
            placeholder="Indique a sua disponibilidade preferida..."
            value={rescheduleNote}
            onChange={(e) => setRescheduleNote(e.target.value)}
          />
          <div className="mt-2 flex justify-end">
            <Button
              size="sm"
              disabled={busy === "resch"}
              onClick={() =>
                run(
                  "resch",
                  () => requestReschedule(bookingId, rescheduleNote),
                  "Reagendamento pedido"
                ).then(() => setRescheduleOpen(false))
              }
            >
              {busy === "resch" && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Enviar pedido
            </Button>
          </div>
        </div>
      )}

      {reviewable && (
        <ReviewForm bookingId={bookingId} onDone={() => router.refresh()} />
      )}
    </div>
  );
}

function ReviewForm({
  bookingId,
  onDone,
}: {
  bookingId: string;
  onDone: () => void;
}) {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (rating < 1) {
      toast({ title: "Escolha uma classificação", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await submitReview({ bookingId, rating, comment: comment || undefined });
      toast({ title: "Obrigado pela avaliação!" });
      onDone();
    } catch (e) {
      toast({
        title: "Erro",
        description: (e as Error).message,
        variant: "destructive",
      });
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="font-semibold">Avaliar o profissional</h3>
      <div className="mt-3 flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const n = i + 1;
          return (
            <button
              key={n}
              type="button"
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(n)}
              aria-label={`${n} estrelas`}
            >
              <Star
                className={cn(
                  "h-7 w-7",
                  (hover || rating) >= n
                    ? "fill-warm text-warm"
                    : "text-muted-foreground/40"
                )}
              />
            </button>
          );
        })}
      </div>
      <Textarea
        className="mt-3"
        placeholder="Como correu o serviço? (opcional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <div className="mt-3 flex justify-end">
        <Button onClick={submit} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Enviar avaliação
        </Button>
      </div>
    </div>
  );
}
