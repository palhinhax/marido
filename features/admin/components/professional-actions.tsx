"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Star, RotateCcw } from "lucide-react";
import type { ApprovalStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  setProfessionalApproval,
  toggleProfessionalFeatured,
} from "../actions";

export function ProfessionalActions({
  professionalId,
  status,
  isFeatured,
}: {
  professionalId: string;
  status: ApprovalStatus;
  isFeatured: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();

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
    <div className="flex flex-wrap gap-2">
      {status !== "APPROVED" && (
        <Button
          size="sm"
          disabled={pending}
          onClick={() =>
            run(
              () => setProfessionalApproval(professionalId, "APPROVED"),
              "Profissional aprovado"
            )
          }
        >
          <Check className="mr-1 h-4 w-4" /> Aprovar
        </Button>
      )}
      {status !== "REJECTED" && (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() =>
            run(
              () => setProfessionalApproval(professionalId, "REJECTED"),
              "Profissional recusado"
            )
          }
        >
          <X className="mr-1 h-4 w-4" /> Recusar
        </Button>
      )}
      {status !== "PENDING" && (
        <Button
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() =>
            run(
              () => setProfessionalApproval(professionalId, "PENDING"),
              "Movido para pendente"
            )
          }
        >
          <RotateCcw className="mr-1 h-4 w-4" /> Repor
        </Button>
      )}
      <Button
        size="sm"
        variant={isFeatured ? "warm" : "outline"}
        disabled={pending}
        onClick={() =>
          run(
            () => toggleProfessionalFeatured(professionalId),
            isFeatured ? "Removido dos destaques" : "Adicionado aos destaques"
          )
        }
      >
        <Star className="mr-1 h-4 w-4" />{" "}
        {isFeatured ? "Destacado" : "Destacar"}
      </Button>
    </div>
  );
}
