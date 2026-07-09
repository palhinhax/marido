import Link from "next/link";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Plus,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getClientBookings } from "@/features/client/queries";
import { StatCard, EmptyState } from "@/components/dashboard/stat-card";
import { BookingCard } from "@/components/booking-card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ClientDashboard() {
  const user = await requireUser(["CLIENT"]);
  const bookings = await getClientBookings(user.id, user.email!);

  const now = Date.now();
  const upcoming = bookings.filter(
    (b) =>
      ["ACCEPTED", "SCHEDULED", "IN_PROGRESS"].includes(b.status) &&
      (!b.scheduledStart ||
        new Date(b.scheduledStart).getTime() >= now - 86400000)
  );
  const pending = bookings.filter((b) => b.status === "PENDING");
  const completed = bookings.filter((b) => b.status === "COMPLETED");
  const cancelled = bookings.filter((b) =>
    ["CANCELLED", "REJECTED", "NO_SHOW"].includes(b.status)
  );

  const toCard = (b: (typeof bookings)[number]) => ({
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
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Olá, {user.name || "cliente"}</h1>
          <p className="text-muted-foreground">
            Acompanhe e gira os seus pedidos.
          </p>
        </div>
        <Link href="/servicos">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Marcar serviço
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Próximos" value={upcoming.length} icon={Clock} />
        <StatCard
          label="Pendentes"
          value={pending.length}
          icon={ClipboardList}
          tone="warm"
        />
        <StatCard
          label="Concluídos"
          value={completed.length}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard label="Cancelados" value={cancelled.length} icon={XCircle} />
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          title="Ainda não tem pedidos"
          description="Marque o seu primeiro serviço em minutos."
          action={
            <Link href="/servicos">
              <Button>Ver serviços</Button>
            </Link>
          }
        />
      ) : (
        <>
          <Section
            title="Próximos"
            href="/dashboard/pedidos"
            items={upcoming.map(toCard)}
            emptyText="Sem serviços agendados."
          />
          <Section
            title="Pendentes"
            items={pending.map(toCard)}
            emptyText="Sem pedidos pendentes."
          />
          {completed.length > 0 && (
            <Section
              title="Concluídos"
              items={completed.slice(0, 3).map(toCard)}
            />
          )}
        </>
      )}
    </div>
  );
}

function Section({
  title,
  href,
  items,
  emptyText,
}: {
  title: string;
  href?: string;
  items: React.ComponentProps<typeof BookingCard>["booking"][];
  emptyText?: string;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        {href && (
          <Link
            href={href}
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Ver todos <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      {items.length === 0 ? (
        emptyText && (
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        )
      ) : (
        <div className="space-y-3">
          {items.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              href={`/dashboard/pedidos/${b.id}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
