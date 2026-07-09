"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { becomeProfessional } from "@/features/professional/actions";

export function BecomeProfessionalPanel({ name }: { name: string }) {
  const router = useRouter();
  const { update } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function upgrade() {
    setLoading(true);
    try {
      await becomeProfessional();
      // Refresh the session so the JWT role becomes PROFESSIONAL before we
      // navigate into the (role-gated) professional area.
      await update();
      toast({
        title: "Conta de profissional criada",
        description: "Vamos configurar o seu perfil.",
      });
      router.push("/profissional/onboarding");
      router.refresh();
    } catch (e) {
      toast({
        title: "Erro",
        description: (e as Error).message,
        variant: "destructive",
      });
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-bold">Tornar-me profissional</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Olá {name}! Já tem conta. Ative o modo profissional para escolher
        serviços, definir a sua disponibilidade e começar a receber pedidos.
      </p>
      <Button
        onClick={upgrade}
        disabled={loading}
        size="lg"
        className="mt-6 w-full"
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Ativar conta de profissional
        {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
      </Button>
      <p className="mt-3 text-xs text-muted-foreground">
        A sua conta passa a ser de profissional. Os pedidos que fez como cliente
        continuam acessíveis pelo mesmo email.
      </p>
    </div>
  );
}
