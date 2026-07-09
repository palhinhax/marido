import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const ROLE_LABEL = {
  CLIENT: "Cliente",
  PROFESSIONAL: "Profissional",
  ADMIN: "Admin",
} as const;

export default async function AdminClientsPage() {
  const users = await prisma.user.findMany({
    include: { _count: { select: { bookingsAsClient: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

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
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b last:border-0">
                <td className="p-3 font-medium">{u.name ?? "—"}</td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
