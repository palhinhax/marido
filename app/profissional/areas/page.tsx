import { prisma } from "@/lib/prisma";
import { getCurrentProfessional } from "@/features/professional/queries";
import { AreasManager } from "@/features/professional/components/areas-manager";

export const dynamic = "force-dynamic";

export default async function ProfessionalAreasPage() {
  const pro = await getCurrentProfessional();
  const areas = await prisma.professionalServiceArea.findMany({
    where: { professionalId: pro.id },
    select: { district: true, municipality: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Áreas de serviço</h1>
        <p className="text-muted-foreground">
          Escolha os distritos e concelhos onde trabalha. Só recebe pedidos
          nestas zonas.
        </p>
      </div>
      <AreasManager initialAreas={areas} />
    </div>
  );
}
