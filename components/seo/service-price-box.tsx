import Link from "next/link";
import { Clock, ShieldCheck, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { priceLabel, durationLabel, PRICE_TYPE_LABEL } from "@/lib/format";
import type { PriceType } from "@prisma/client";

interface Props {
  price: number | null;
  priceType: PriceType;
  durationMinutes: number;
  requiresPhotos?: boolean;
  bookHref: string;
  location?: string;
}

// The conversion-focused price + CTA card used on service and landing pages.
export function ServicePriceBox({
  price,
  priceType,
  durationMinutes,
  requiresPhotos,
  bookHref,
  location,
}: Props) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {PRICE_TYPE_LABEL[priceType]}
      </p>
      <p className="mt-1 text-3xl font-bold text-primary">
        {price === null ? "Sob avaliação" : priceLabel(price, priceType)}
      </p>

      <ul className="mt-4 space-y-2 text-sm">
        <li className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4 text-primary" />
          Duração estimada: {durationLabel(durationMinutes)}
        </li>
        <li className="flex items-center gap-2 text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Profissionais avaliados{location ? ` em ${location}` : ""}
        </li>
        {requiresPhotos && (
          <li className="flex items-center gap-2 text-muted-foreground">
            <Camera className="h-4 w-4 text-primary" />
            Fotos recomendadas para um orçamento preciso
          </li>
        )}
      </ul>

      <Link href={bookHref} className="mt-5 block">
        <Button size="lg" className="w-full">
          Marcar serviço
        </Button>
      </Link>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Sem compromisso · Preço confirmado antes de avançar
      </p>
    </div>
  );
}
