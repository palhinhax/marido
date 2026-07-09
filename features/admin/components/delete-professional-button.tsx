"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/use-toast";
import { deleteProfessional } from "../actions";

export function DeleteProfessionalButton({
  professionalId,
  name,
  redirectTo,
  size = "sm",
}: {
  professionalId: string;
  name: string;
  redirectTo?: string;
  size?: "sm" | "default";
}) {
  const router = useRouter();
  const { toast } = useToast();

  async function onConfirm() {
    try {
      await deleteProfessional(professionalId);
      toast({ title: "Profissional apagado" });
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
    } catch (e) {
      toast({
        title: "Erro",
        description: (e as Error).message,
        variant: "destructive",
      });
    }
  }

  return (
    <ConfirmDialog
      title={`Apagar o profissional "${name}"?`}
      description="Esta ação é irreversível: remove a conta, serviços, áreas e avaliações. Os pedidos são mantidos, mas ficam sem profissional atribuído."
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
