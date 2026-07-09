"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { setReviewApproval, deleteReview } from "../actions";

export function ReviewActions({
  reviewId,
  isApproved,
}: {
  reviewId: string;
  isApproved: boolean;
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
      } catch {
        toast({ title: "Erro", variant: "destructive" });
      }
    });

  return (
    <div className="flex gap-2">
      {isApproved ? (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() =>
            run(() => setReviewApproval(reviewId, false), "Avaliação escondida")
          }
        >
          <EyeOff className="mr-1 h-4 w-4" /> Esconder
        </Button>
      ) : (
        <Button
          size="sm"
          disabled={pending}
          onClick={() =>
            run(() => setReviewApproval(reviewId, true), "Avaliação aprovada")
          }
        >
          <Eye className="mr-1 h-4 w-4" /> Aprovar
        </Button>
      )}
      <Button
        size="sm"
        variant="outline"
        className="text-destructive hover:bg-destructive/10"
        disabled={pending}
        onClick={() => {
          if (confirm("Eliminar esta avaliação?"))
            run(() => deleteReview(reviewId), "Avaliação eliminada");
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
