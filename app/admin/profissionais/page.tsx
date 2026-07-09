import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProfessionalActions } from "@/features/admin/components/professional-actions";
import { DeleteProfessionalButton } from "@/features/admin/components/delete-professional-button";
import { Badge } from "@/components/ui/badge";
import { Stars } from "@/components/stars";
import { APPROVAL_STATUS_LABEL } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminProfessionalsPage() {
  const pros = await prisma.professionalProfile.findMany({
    include: {
      user: { select: { email: true } },
      _count: {
        select: { services: true, serviceAreas: true, bookings: true },
      },
    },
    orderBy: [{ approvalStatus: "asc" }, { createdAt: "desc" }],
  });

  const pending = pros.filter((p) => p.approvalStatus === "PENDING");
  const others = pros.filter((p) => p.approvalStatus !== "PENDING");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Profissionais</h1>
        <p className="text-muted-foreground">
          Aprove, recuse e destaque profissionais.
        </p>
      </div>

      {pending.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">
            A aguardar aprovação ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map((p) => (
              <ProCard key={p.id} pro={p} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold">Todos os profissionais</h2>
        <div className="space-y-3">
          {others.map((p) => (
            <ProCard key={p.id} pro={p} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ProCard({
  pro,
}: {
  pro: {
    id: string;
    slug: string;
    displayName: string;
    approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
    isFeatured: boolean;
    ratingAverage: number;
    ratingCount: number;
    user: { email: string };
    _count: { services: number; serviceAreas: number; bookings: number };
  };
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/profissionais/${pro.id}`}
              className="font-semibold hover:underline"
            >
              {pro.displayName}
            </Link>
            <Badge
              variant={
                pro.approvalStatus === "APPROVED"
                  ? "success"
                  : pro.approvalStatus === "REJECTED"
                    ? "muted"
                    : "warm"
              }
            >
              {APPROVAL_STATUS_LABEL[pro.approvalStatus]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{pro.user.email}</p>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Stars value={pro.ratingAverage} size={12} />{" "}
              {pro.ratingAverage.toFixed(1)} ({pro.ratingCount})
            </span>
            <span>{pro._count.services} serviços</span>
            <span>{pro._count.serviceAreas} áreas</span>
            <span>{pro._count.bookings} pedidos</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <ProfessionalActions
            professionalId={pro.id}
            status={pro.approvalStatus}
            isFeatured={pro.isFeatured}
          />
          <div className="flex gap-2">
            <Link
              href={`/admin/profissionais/${pro.id}`}
              className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted"
            >
              Gerir
            </Link>
            <DeleteProfessionalButton
              professionalId={pro.id}
              name={pro.displayName}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
