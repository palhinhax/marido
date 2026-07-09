import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ServiceRowActions } from "@/features/admin/components/service-row-actions";
import { Button } from "@/components/ui/button";
import { PRICE_TYPE_LABEL } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const categories = await prisma.serviceCategory.findMany({
    orderBy: { order: "asc" },
    include: {
      services: {
        orderBy: { order: "asc" },
        include: { _count: { select: { professionalServices: true } } },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Serviços</h1>
          <p className="text-muted-foreground">
            Criar, editar e gerir os serviços da plataforma.
          </p>
        </div>
        <Link href="/admin/servicos/novo">
          <Button>
            <Plus className="mr-1 h-4 w-4" /> Novo serviço
          </Button>
        </Link>
      </div>

      {categories.map((c) => (
        <section key={c.id}>
          <h2 className="mb-3 text-lg font-semibold">
            {c.name}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              ({c.services.length})
            </span>
          </h2>
          {c.services.length === 0 ? (
            <p className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
              Sem serviços nesta categoria.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border bg-card">
              <table className="w-full min-w-[680px] text-sm">
                <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="p-3">Serviço</th>
                    <th className="p-3">Tipo de preço</th>
                    <th className="p-3">Profissionais</th>
                    <th className="p-3 text-right">Preço base / estado</th>
                  </tr>
                </thead>
                <tbody>
                  {c.services.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b last:border-0 hover:bg-muted/40"
                    >
                      <td className="p-3 font-medium">
                        <Link
                          href={`/admin/servicos/${s.id}`}
                          className="text-primary hover:underline"
                        >
                          {s.name}
                        </Link>
                        {!s.isActive && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (inativo)
                          </span>
                        )}
                      </td>
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
          )}
        </section>
      ))}
    </div>
  );
}
