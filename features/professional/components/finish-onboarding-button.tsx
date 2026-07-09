"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { finishOnboarding } from "../actions";

export function FinishOnboardingButton() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function finish() {
    setLoading(true);
    try {
      await finishOnboarding();
      toast({
        title: "Perfil submetido!",
        description:
          "A sua conta está em análise. Avisamos assim que for aprovada.",
      });
      router.push("/profissional");
      router.refresh();
    } catch {
      toast({ title: "Erro", variant: "destructive" });
      setLoading(false);
    }
  }

  return (
    <Button size="lg" onClick={finish} disabled={loading}>
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <CheckCircle2 className="mr-2 h-4 w-4" />
      )}
      Concluir e submeter para aprovação
    </Button>
  );
}
