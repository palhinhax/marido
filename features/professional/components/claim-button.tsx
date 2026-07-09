"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Hand, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { claimBooking } from "../actions";

export function ClaimButton({
  bookingId,
  size = "sm",
}: {
  bookingId: string;
  size?: "sm" | "default";
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);

  function claim() {
    start(async () => {
      try {
        await claimBooking(bookingId);
        setDone(true);
        toast({
          title: "Pedido aceite!",
          description: "O pedido é agora seu. Está em Aceites e agendados.",
        });
        router.refresh();
      } catch (e) {
        toast({
          title: "Não foi possível aceitar",
          description: (e as Error).message,
          variant: "destructive",
        });
        router.refresh();
      }
    });
  }

  return (
    <Button size={size} onClick={claim} disabled={pending || done}>
      {pending ? (
        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
      ) : (
        <Hand className="mr-1 h-4 w-4" />
      )}
      Aceitar este pedido
    </Button>
  );
}
