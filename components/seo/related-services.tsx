import { ServiceCard, type ServiceCardData } from "@/components/service-card";

export function RelatedServices({
  services,
  title = "Serviços relacionados",
}: {
  services: ServiceCardData[];
  title?: string;
}) {
  if (!services.length) return null;
  return (
    <section>
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <ServiceCard key={s.slug} service={s} />
        ))}
      </div>
    </section>
  );
}
