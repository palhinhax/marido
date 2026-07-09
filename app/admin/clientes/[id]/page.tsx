import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Mail, Phone, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { BookingStatusBadge } from "@/components/status-badge";
import { DeleteUserButton } from "@/features/admin/components/delete-user-button";
import { euros, formatDate, formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

const ROLE_LABEL = {
  CLIENT: "Cliente",
  PROFESSIONAL: "Profissional",
  ADMIN: "Admin",
} as const;

export default async function AdminUserDetail({
  params,
}: {
  params: { id: string };
}) {
  const [user, current] = await Promise.all([
    prisma.user.findUnique({
      where: { id: params.id },
      include: {
        professionalProfile: { select: { id: true, displayName: true } },
        _count: { select: { bookingsAsClient: true, reviewsWritten: true } },
        bookingsAsClient: {
          include: { service: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    }),
    getCurrentUser(),
  ]);

  if (!user) notFound();
  const isSelf = current?.id === user.id;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/clientes"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="mr-1 h-4 w-4" /> Voltar aos utilizadores
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">{user.name ?? "Sem nome"}</h1>
            <Badge
              variant={
                user.role === "ADMIN"
                  ? "default"
                  : user.role === "PROFESSIONAL"
                    ? "secondary"
                    : "muted"
              }
            >
              {ROLE_LABEL[user.role]}
            </Badge>
          </div>
          <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> {user.email}
            </span>
            <span className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> {user.phone ?? "—"}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>{user._count.bookingsAsClient} pedidos como cliente</span>
            <span>{user._count.reviewsWritten} avaliações escritas</span>
            <span>Registo: {formatDate(user.createdAt)}</span>
          </div>
          {user.professionalProfile && (
            <Link
              href={`/admin/profissionais/${user.professionalProfile.id}`}
              className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <ShieldCheck className="h-4 w-4" /> Gerir perfil profissional (
              {user.professionalProfile.displayName})
            </Link>
          )}
        </div>
        {isSelf ? (
          <span className="text-sm text-muted-foreground">A sua conta</span>
        ) : (
          <DeleteUserButton
            userId={user.id}
            name={user.name ?? user.email}
            redirectTo="/admin/clientes"
            size="default"
          />
        )}
      </div>

      {/* Bookings */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">
          Pedidos como cliente ({user._count.bookingsAsClient})
        </h2>
        {user.bookingsAsClient.length === 0 ? (
          <p className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
            Sem pedidos.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="p-3">Ref.</th>
                  <th className="p-3">Serviço</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Criado</th>
                  <th className="p-3 text-right">Preço</th>
                </tr>
              </thead>
              <tbody>
                {user.bookingsAsClient.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b last:border-0 hover:bg-muted/40"
                  >
                    <td className="p-3">
                      <Link
                        href={`/admin/pedidos/${b.id}`}
                        className="font-mono text-xs text-primary hover:underline"
                      >
                        {b.reference}
                      </Link>
                    </td>
                    <td className="p-3">{b.service.name}</td>
                    <td className="p-3">
                      <BookingStatusBadge status={b.status} />
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {formatDateTime(b.createdAt)}
                    </td>
                    <td className="p-3 text-right">
                      {b.estimatedPrice ? euros(b.estimatedPrice) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
