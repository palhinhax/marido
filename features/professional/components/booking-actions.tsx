"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Play, CheckCircle2, UserX, Loader2 } from "lucide-react";
import type { BookingStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { respondToBooking } from "../actions";

type Action = "ACCEPT" | "REJECT" | "START" | "COMPLETE" | "NO_SHOW";

export function BookingActions({
  bookingId,
  status,
  size = "sm",
}: {
  bookingId: string;
  status: BookingStatus;
  size?: "sm" | "default";
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<Action | null>(null);

  function act(action: Action) {
    setBusy(action);
    startTransition(async () => {
      try {
        await respondToBooking(bookingId, action);
        toast({ title: "Pedido atualizado" });
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
    });
  }

  const spin = (a: Action) => busy === a && pending;

  if (status === "PENDING") {
    return (
      <div className="flex gap-2">
        <Button size={size} onClick={() => act("ACCEPT")} disabled={pending}>
          {spin("ACCEPT") ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          ) : (
            <Check className="mr-1 h-4 w-4" />
          )}
          Aceitar
        </Button>
        <Button
          size={size}
          variant="outline"
          onClick={() => act("REJECT")}
          disabled={pending}
        >
          <X className="mr-1 h-4 w-4" /> Recusar
        </Button>
      </div>
    );
  }
  if (status === "ACCEPTED" || status === "SCHEDULED") {
    return (
      <div className="flex gap-2">
        <Button size={size} onClick={() => act("START")} disabled={pending}>
          {spin("START") ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          ) : (
            <Play className="mr-1 h-4 w-4" />
          )}
          Iniciar
        </Button>
        <Button
          size={size}
          variant="outline"
          onClick={() => act("NO_SHOW")}
          disabled={pending}
        >
          <UserX className="mr-1 h-4 w-4" /> Não compareceu
        </Button>
      </div>
    );
  }
  if (status === "IN_PROGRESS") {
    return (
      <Button size={size} onClick={() => act("COMPLETE")} disabled={pending}>
        {spin("COMPLETE") ? (
          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle2 className="mr-1 h-4 w-4" />
        )}
        Concluir
      </Button>
    );
  }
  return null;
}
