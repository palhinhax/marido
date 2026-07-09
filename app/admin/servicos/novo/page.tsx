import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  ServiceForm,
  EMPTY_SERVICE,
} from "@/features/admin/components/service-form";

export const dynamic = "force-dynamic";

export default async function NewServicePage() {
  const categories = await prisma.serviceCategory.findMany({
    orderBy: { order: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6">
      <Link
        href="/admin/servicos"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="mr-1 h-4 w-4" /> Voltar aos serviços
      </Link>
      <h1 className="text-2xl font-bold">Novo serviço</h1>
      <ServiceForm categories={categories} initial={EMPTY_SERVICE} />
    </div>
  );
}
