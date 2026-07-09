import { prisma } from "@/lib/prisma";
import { getCurrentProfessional } from "@/features/professional/queries";
import { ServicesManager } from "@/features/professional/components/services-manager";
import { CATALOG } from "@/lib/data/catalog";

export const dynamic = "force-dynamic";

export default async function ProfessionalServicesPage() {
  const pro = await getCurrentProfessional();
  const [services, selected] = await Promise.all([
    prisma.service.findMany({
      include: { category: { select: { name: true, slug: true } } },
    }),
    prisma.professionalService.findMany({
      where: { professionalId: pro.id },
      select: { serviceId: true },
    }),
  ]);

  // Group by catalog category order
  const groups = CATALOG.map((c) => ({
    category: c.name,
    items: services
      .filter((s) => s.category.slug === c.slug)
      .map((s) => ({ id: s.id, name: s.name })),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Serviços que faço</h1>
        <p className="text-muted-foreground">
          Selecione os serviços que oferece. Só receberá pedidos destes
          serviços.
        </p>
      </div>
      <ServicesManager
        groups={groups}
        initialSelected={selected.map((s) => s.serviceId)}
      />
    </div>
  );
}
