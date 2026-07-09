import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServiceBySlug } from "@/lib/data/catalog";
import { getCurrentUser } from "@/lib/auth";
import { BookingWizard } from "@/features/booking/components/booking-wizard";

export const dynamic = "force-dynamic";

export function generateMetadata({
  params,
}: {
  params: { serviceSlug: string };
}): Metadata {
  const service = getServiceBySlug(params.serviceSlug);
  return {
    title: service ? `Marcar ${service.name}` : "Marcar serviço",
    robots: { index: false },
  };
}

export default async function MarcarPage({
  params,
  searchParams,
}: {
  params: { serviceSlug: string };
  searchParams: { loc?: string };
}) {
  const service = getServiceBySlug(params.serviceSlug);
  if (!service) notFound();

  const user = await getCurrentUser();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      <BookingWizard
        service={{
          name: service.name,
          slug: service.slug,
          categoryName: service.category.name,
          categorySlug: service.category.slug,
          basePrice: service.basePrice,
          priceType: service.priceType,
          durationMinutes: service.estimatedDurationMinutes,
          requiresPhotos: service.requiresPhotos,
        }}
        initialLocationSlug={searchParams.loc}
        defaultContact={
          user ? { name: user.name, email: user.email } : undefined
        }
      />
    </div>
  );
}
