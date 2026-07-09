import Link from "next/link";
import { Button } from "@/components/ui/button";
import { priceLabel } from "@/lib/format";
import type { PriceType } from "@prisma/client";

// Sticky bottom CTA shown on mobile service/landing pages.
export function MobileCTA({
  price,
  priceType,
  bookHref,
}: {
  price: number | null;
  priceType: PriceType;
  bookHref: string;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 p-3 backdrop-blur md:hidden">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Preço</p>
          <p className="font-bold text-primary">
            {priceLabel(price, priceType)}
          </p>
        </div>
        <Link href={bookHref} className="flex-1">
          <Button className="w-full" size="lg">
            Marcar serviço
          </Button>
        </Link>
      </div>
    </div>
  );
}
