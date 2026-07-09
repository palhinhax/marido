"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { deleteUser } from "../actions";

export function DeleteUserButton({
  userId,
  name,
  redirectTo,
  size = "sm",
}: {
  userId: string;
  name: string;
  redirectTo?: string;
  size?: "sm" | "default";
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();

  function onDelete() {
    const ok = window.confirm(
      `Apagar o utilizador "${name}"?\n\nEsta ação é irreversível: remove a conta e os perfis associados. Os pedidos são mantidos, mas ficam sem cliente/profissional associado.`
    );
    if (!ok) return;
    start(async () => {
      try {
        await deleteUser(userId);
        toast({ title: "Utilizador apagado" });
        if (redirectTo) router.push(redirectTo);
        else router.refresh();
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
