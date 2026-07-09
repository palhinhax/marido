import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ServiceForm } from "@/features/admin/components/service-form";
import { DeleteServiceButton } from "@/features/admin/components/delete-service-button";

export const dynamic = "force-dynamic";

export default async function EditServicePage({
  params,
}: {
  params: { id: string };
}) {
  const [service, categories] = await Promise.all([
    prisma.service.findUnique({
      where: { id: params.id },
      include: {
        extras: true,
        faqs: { orderBy: { order: "asc" } },
        _count: { select: { bookings: true } },
      },
    }),
    prisma.serviceCategory.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!service) notFound();

  const initial = {
    categoryId: service.categoryId,
    name: service.name,
    slug: service.slug,
    shortDescription: service.shortDescription,
    description: service.description,
    priceType: service.priceType,
    basePrice: service.basePrice?.toString() ?? "",
    estimatedDurationMinutes: service.estimatedDurationMinutes.toString(),
    requiresPhotos: service.requiresPhotos,
    requiresQuote: service.requiresQuote,
    professionalRole: service.professionalRole ?? "",
    seoTitle: service.seoTitle ?? "",
    seoDescription: service.seoDescription ?? "",
    isActive: service.isActive,
    order: service.order.toString(),
    included: service.included.join("\n"),
    notIncluded: service.notIncluded.join("\n"),
    extras: service.extras.map((e) => ({
      name: e.name,
      price: e.price.toString(),
    })),
    faqs: service.faqs.map((f) => ({ question: f.question, answer: f.answer })),
  };

  return (
    <div className="space-y-6">
      <Link
        href="/admin/servicos"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="mr-1 h-4 w-4" /> Voltar aos serviços
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{service.name}</h1>
          <p className="text-sm text-muted-foreground">
            {service._count.bookings} pedidos ·{" "}
            {service.isActive ? "Ativo" : "Inativo"}
          </p>
        </div>
        <DeleteServiceButton
          serviceId={service.id}
          name={service.name}
          redirectTo="/admin/servicos"
          size="default"
        />
      </div>
      <ServiceForm
        categories={categories}
        initial={initial}
        serviceId={service.id}
      />
    </div>
  );
}
