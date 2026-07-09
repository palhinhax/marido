import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ExternalLink, Mail } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Stars } from "@/components/stars";
import { ProfessionalActions } from "@/features/admin/components/professional-actions";
import { ProfessionalEditForm } from "@/features/admin/components/professional-edit-form";
import { DeleteProfessionalButton } from "@/features/admin/components/delete-professional-button";
import { APPROVAL_STATUS_LABEL, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminProfessionalDetail({
  params,
}: {
  params: { id: string };
}) {
  const pro = await prisma.professionalProfile.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { email: true, createdAt: true } },
      services: { include: { service: { select: { name: true } } } },
      serviceAreas: true,
      _count: {
        select: { services: true, serviceAreas: true, bookings: true },
      },
    },
  });

  if (!pro) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/profissionais"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="mr-1 h-4 w-4" /> Voltar aos profissionais
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">{pro.displayName}</h1>
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
            {pro.isFeatured && <Badge variant="warm">Destacado</Badge>}
          </div>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" /> {pro.user.email}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Stars value={pro.ratingAverage} size={12} />{" "}
              {pro.ratingAverage.toFixed(1)} ({pro.ratingCount})
            </span>
            <span>{pro._count.services} serviços</span>
            <span>{pro._count.serviceAreas} áreas</span>
            <span>{pro._count.bookings} pedidos</span>
            <span>Registo: {formatDate(pro.user.createdAt)}</span>
          </div>
          <Link
            href={`/profissionais/${pro.slug}`}
            target="_blank"
            className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Ver perfil público <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
        <DeleteProfessionalButton
          professionalId={pro.id}
          name={pro.displayName}
          redirectTo="/admin/profissionais"
          size="default"
        />
      </div>

      {/* Approval / visibility */}
      <div className="rounded-xl border bg-card p-4">
        <p className="mb-3 text-sm font-medium">Estado e visibilidade</p>
        <ProfessionalActions
          professionalId={pro.id}
          status={pro.approvalStatus}
          isFeatured={pro.isFeatured}
        />
      </div>

      {/* Edit form */}
      <section className="rounded-xl border bg-card p-5">
        <h2 className="mb-4 font-semibold">Editar dados</h2>
        <ProfessionalEditForm
          professionalId={pro.id}
          initial={{
            displayName: pro.displayName,
            headline: pro.headline ?? "",
            description: pro.description ?? "",
            phone: pro.phone ?? "",
            whatsapp: pro.whatsapp ?? "",
            website: pro.website ?? "",
            nif: pro.nif ?? "",
            companyName: pro.companyName ?? "",
            yearsExperience: pro.yearsExperience ?? "",
          }}
        />
      </section>

      {/* Services & areas (read-only) */}
      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold">Serviços ({pro.services.length})</h2>
          {pro.services.length ? (
            <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
              {pro.services.map((s) => (
                <li key={s.id}>
                  {s.service.name}
                  {s.customPrice != null ? ` · ${s.customPrice}€` : ""}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Sem serviços associados.
            </p>
          )}
        </section>
        <section className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold">Áreas ({pro.serviceAreas.length})</h2>
          {pro.serviceAreas.length ? (
            <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
              {pro.serviceAreas.map((a) => (
                <li key={a.id}>
                  {a.municipality ?? "Todo o distrito"} · {a.district}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Sem áreas definidas.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
