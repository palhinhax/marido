import { prisma } from "@/lib/prisma";
import { getCurrentProfessional } from "@/features/professional/queries";
import { WeeklyAvailabilityGrid } from "@/features/professional/components/weekly-availability-grid";
import { rulesToGrid } from "@/lib/availability";

export const dynamic = "force-dynamic";

// Hours shown in the grid (each row is a 1h block).
const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 07:00 → 21:00

export default async function AvailabilityPage() {
  const pro = await getCurrentProfessional();
  const [rules, exceptions] = await Promise.all([
    prisma.availabilityRule.findMany({ where: { professionalId: pro.id } }),
    prisma.availabilityException.findMany({
      where: { professionalId: pro.id },
      orderBy: { date: "asc" },
    }),
  ]);

  const selection = rulesToGrid(rules);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">A minha disponibilidade</h1>
        <p className="text-muted-foreground">
          Defina as horas em que está disponível. Esta disponibilidade é usada
          para mostrar horários aos clientes.
        </p>
      </div>

      <WeeklyAvailabilityGrid
        initialSelection={selection}
        hours={HOURS}
        exceptions={exceptions.map((e) => ({
          id: e.id,
          date: e.date.toISOString().slice(0, 10),
          type: e.type,
          startTime: e.startTime,
          endTime: e.endTime,
          reason: e.reason,
        }))}
      />
    </div>
  );
}
