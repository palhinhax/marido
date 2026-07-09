import * as Icons from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type IconName = keyof typeof Icons;

export default async function AdminCategoriesPage() {
  const categories = await prisma.serviceCategory.findMany({
    include: { _count: { select: { services: true } } },
    orderBy: { order: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Categorias</h1>
        <p className="text-muted-foreground">
          Categorias de serviços da plataforma.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => {
          const Icon =
            (c.icon && (Icons[c.icon as IconName] as Icons.LucideIcon)) ||
            Icons.Wrench;
          return (
            <div key={c.id} className="rounded-xl border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold">{c.name}</h2>
                  <p className="text-xs text-muted-foreground">/{c.slug}</p>
                </div>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                {c.description}
              </p>
              <p className="mt-3 text-xs font-medium text-muted-foreground">
                {c._count.services} serviços
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
