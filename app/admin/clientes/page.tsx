import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { DeleteUserButton } from "@/features/admin/components/delete-user-button";

export const dynamic = "force-dynamic";

const ROLE_LABEL = {
  CLIENT: "Cliente",
  PROFESSIONAL: "Profissional",
  ADMIN: "Admin",
} as const;

export default async function AdminClientsPage() {
  const [users, current] = await Promise.all([
    prisma.user.findMany({
      include: { _count: { select: { bookingsAsClient: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    getCurrentUser(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Utilizadores</h1>
        <p className="text-muted-foreground">
          Clientes e contas da plataforma.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">Email</th>
              <th className="p-3">Telefone</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Pedidos</th>
              <th className="p-3">Registo</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-b transition-colors last:border-0 hover:bg-muted/40"
              >
                <td className="p-3 font-medium">
                  <Link
                    href={`/admin/clientes/${u.id}`}
                    className="text-primary hover:underline"
                  >
                    {u.name ?? "Sem nome"}
                  </Link>
                </td>
                <td className="p-3 text-muted-foreground">{u.email}</td>
                <td className="p-3 text-muted-foreground">{u.phone ?? "—"}</td>
                <td className="p-3">
                  <Badge
                    variant={
                      u.role === "ADMIN"
                        ? "default"
                        : u.role === "PROFESSIONAL"
                          ? "secondary"
                          : "muted"
                    }
                  >
                    {ROLE_LABEL[u.role]}
                  </Badge>
                </td>
                <td className="p-3 text-muted-foreground">
                  {u._count.bookingsAsClient}
                </td>
                <td className="p-3 text-muted-foreground">
                  {formatDate(u.createdAt)}
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/clientes/${u.id}`}
                      className="inline-flex items-center text-primary hover:underline"
                    >
                      Ver <ChevronRight className="h-4 w-4" />
                    </Link>
                    {current?.id !== u.id && (
                      <DeleteUserButton
                        userId={u.id}
                        name={u.name ?? u.email}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
