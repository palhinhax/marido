"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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

  async function onConfirm() {
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
  }

  return (
    <ConfirmDialog
      title={`Apagar o serviço "${name}"?`}
      description="Esta ação é irreversível."
      confirmLabel="Apagar"
      destructive
      onConfirm={onConfirm}
      trigger={
        <Button
          size={size}
          variant="outline"
          className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="mr-1 h-4 w-4" /> Apagar
        </Button>
      }
    />
  );
}
