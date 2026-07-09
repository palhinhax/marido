"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { deleteService } from "../catalog-actions";

export function DeleteServiceButton({
  serviceId,
  name,
  redirectTo,
  size = "sm",
}: {
  serviceId: string;
  name: string;
  redirectTo?: string;
  size?: "sm" | "default";
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();

  function onDelete() {
    if (
      !window.confirm(`Apagar o serviço "${name}"? Esta ação é irreversível.`)
    )
      return;
    start(async () => {
      try {
        await deleteService(serviceId);
        toast({ title: "Serviço apagado" });
        if (redirectTo) router.push(redirectTo);
        else router.refresh();
      } catch (e) {
        toast({
          title: "Não foi possível apagar",
          description: (e as Error).message,
          variant: "destructive",
        });
      }
    });
  }

  return (
    <Button
      size={size}
      variant="outline"
      onClick={onDelete}
      disabled={pending}
      className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
    >
      {pending ? (
        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="mr-1 h-4 w-4" />
      )}
      Apagar
    </Button>
  );
}
