import { prisma } from "@/lib/prisma";
import { ServiceRowActions } from "@/features/admin/components/service-row-actions";
import { PRICE_TYPE_LABEL } from "@/lib/format";
import { CATALOG } from "@/lib/data/catalog";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({
    include: {
      category: { select: { name: true, slug: true } },
      _count: { select: { professionalServices: true } },
    },
  });

  const groups = CATALOG.map((c) => ({
    name: c.name,
    slug: c.slug,
    items: services.filter((s) => s.category.slug === c.slug),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Serviços</h1>
        <p className="text-muted-foreground">
          Gerir preços base e disponibilidade dos serviços.
        </p>
      </div>

      {groups.map((g) => (
        <section key={g.slug}>
          <h2 className="mb-3 text-lg font-semibold">{g.name}</h2>
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="p-3">Serviço</th>
                  <th className="p-3">Tipo de preço</th>
                  <th className="p-3">Profissionais</th>
                  <th className="p-3 text-right">Preço base / estado</th>
                </tr>
              </thead>
              <tbody>
                {g.items.map((s) => (
                  <tr key={s.id} className="border-b last:border-0">
                    <td className="p-3 font-medium">{s.name}</td>
                    <td className="p-3 text-muted-foreground">
                      {PRICE_TYPE_LABEL[s.priceType]}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {s._count.professionalServices}
                    </td>
                    <td className="p-3">
                      <ServiceRowActions
                        serviceId={s.id}
                        isActive={s.isActive}
                        basePrice={s.basePrice}
                        priceType={s.priceType}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
