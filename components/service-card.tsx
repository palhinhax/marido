import Link from "next/link";
import * as Icons from "lucide-react";
import { ArrowRight } from "lucide-react";
import { priceLabel } from "@/lib/format";
import type { PriceType } from "@prisma/client";

type IconName = keyof typeof Icons;

export interface ServiceCardData {
  name: string;
  slug: string;
  categorySlug: string;
  shortDescription: string;
  basePrice: number | null;
  priceType: PriceType;
  icon?: string;
}

export function ServiceCard({ service }: { service: ServiceCardData }) {
  const Icon =
    (service.icon && (Icons[service.icon as IconName] as Icons.LucideIcon)) ||
    Icons.Wrench;
  return (
    <Link
      href={`/servicos/${service.categorySlug}/${service.slug}`}
      className="group flex flex-col rounded-xl border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-3 font-semibold">{service.name}</h3>
      <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted-foreground">
        {service.shortDescription}
      </p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-primary">
          {priceLabel(service.basePrice, service.priceType)}
        </span>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
