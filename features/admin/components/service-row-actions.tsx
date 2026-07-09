"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import type { PriceType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { toggleServiceActive, updateServicePrice } from "../actions";

export function ServiceRowActions({
  serviceId,
  isActive,
  basePrice,
  priceType,
}: {
  serviceId: string;
  isActive: boolean;
  basePrice: number | null;
  priceType: PriceType;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [price, setPrice] = useState<string>(basePrice?.toString() ?? "");

  const isQuote = priceType === "QUOTE";

  function savePrice() {
    start(async () => {
      try {
        await updateServicePrice(
          serviceId,
          price === "" ? null : Number(price)
        );
        toast({ title: "Preço atualizado" });
        router.refresh();
      } catch {
        toast({ title: "Erro", variant: "destructive" });
      }
    });
  }

  function toggle() {
    start(async () => {
      try {
        await toggleServiceActive(serviceId);
        router.refresh();
      } catch {
        toast({ title: "Erro", variant: "destructive" });
      }
    });
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {!isQuote && (
        <div className="flex items-center gap-1">
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="h-8 w-20"
            aria-label="Preço base"
          />
          <span className="text-xs text-muted-foreground">€</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={savePrice}
            disabled={pending}
            aria-label="Guardar preço"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
      <Button
        size="sm"
        variant={isActive ? "outline" : "warm"}
        onClick={toggle}
        disabled={pending}
      >
        {isActive ? "Ativo" : "Inativo"}
      </Button>
    </div>
  );
}
