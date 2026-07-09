import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getClientBookings } from "@/features/client/queries";
import { BookingCard } from "@/components/booking-card";
import { EmptyState } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import type { BookingStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const GROUPS: { title: string; statuses: BookingStatus[] }[] = [
  { title: "Pendentes", statuses: ["PENDING", "RESCHEDULE_REQUESTED"] },
  { title: "Agendados", statuses: ["ACCEPTED", "SCHEDULED", "IN_PROGRESS"] },
  { title: "Concluídos", statuses: ["COMPLETED"] },
  {
    title: "Cancelados / recusados",
    statuses: ["CANCELLED", "REJECTED", "NO_SHOW"],
  },
];

export default async function ClientBookingsPage() {
  const user = await requireUser(["CLIENT"]);
  const bookings = await getClientBookings(user.id, user.email!);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Os meus pedidos</h1>
          <p className="text-muted-foreground">
            Todos os seus pedidos num só lugar.
          </p>
        </div>
        <Link href="/servicos">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Novo pedido
          </Button>
        </Link>
      </div>

      {bookings.length === 0 && (
        <EmptyState
          title="Ainda não tem pedidos"
          action={
            <Link href="/servicos">
              <Button>Ver serviços</Button>
            </Link>
          }
        />
      )}

      {GROUPS.map((g) => {
        const items = bookings.filter((b) => g.statuses.includes(b.status));
        if (!items.length) return null;
        return (
          <section key={g.title}>
            <h2 className="mb-3 text-lg font-semibold">
              {g.title}{" "}
              <span className="text-sm text-muted-foreground">
                ({items.length})
              </span>
            </h2>
            <div className="space-y-3">
              {items.map((b) => (
                <BookingCard
                  key={b.id}
                  href={`/dashboard/pedidos/${b.id}`}
                  booking={{
                    id: b.id,
                    reference: b.reference,
                    status: b.status,
                    serviceName: b.service.name,
                    city: b.city,
                    municipality: b.municipality,
                    scheduledStart: b.scheduledStart,
                    estimatedPrice: b.estimatedPrice,
                    priceType: b.priceType,
                    urgency: b.urgency,
                    counterpartName: b.professional?.displayName ?? null,
                  }}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
