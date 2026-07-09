import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, MapPin, CheckCircle2, Briefcase } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Stars } from "@/components/stars";
import { ReviewCard } from "@/components/review-card";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { localBusinessJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const pro = await prisma.professionalProfile.findUnique({
    where: { slug: params.slug },
  });
  if (!pro) return {};
  return {
    title: `${pro.displayName} — Profissional em Portugal`,
    description: pro.headline ?? pro.description ?? undefined,
  };
}

export default async function PublicProfessionalPage({
  params,
}: {
  params: { slug: string };
}) {
  const pro = await prisma.professionalProfile.findUnique({
    where: { slug: params.slug },
    include: {
      services: {
        include: {
          service: {
            select: {
              name: true,
              slug: true,
              category: { select: { slug: true } },
            },
          },
        },
      },
      serviceAreas: true,
      reviews: {
        where: { isApproved: true },
        include: {
          client: { select: { name: true } },
          booking: { select: { service: { select: { name: true } } } },
        },
        orderBy: { createdAt: "desc" },
        take: 6,
      },
    },
  });

  if (!pro || pro.approvalStatus !== "APPROVED") notFound();

  const crumbs = [
    { name: "Início", href: "/" },
    { name: "Profissionais", href: "/servicos" },
    { name: pro.displayName, href: `/profissionais/${pro.slug}` },
  ];

  // group areas by district
  const districts = Array.from(
    new Set(pro.serviceAreas.map((a) => a.district))
  );

  return (
    <div className="mx-auto max-w-4xl space-y-10 px-4 py-10">
      <JsonLd
        data={localBusinessJsonLd({
          name: pro.displayName,
          description: pro.headline ?? pro.description ?? "",
          url: `/profissionais/${pro.slug}`,
          areaServed: districts[0] ?? "Portugal",
          rating: { value: pro.ratingAverage, count: pro.ratingCount },
        })}
      />
      <Breadcrumbs crumbs={crumbs} />

      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-3xl font-bold text-primary">
          {pro.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={pro.photoUrl}
              alt={pro.displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            pro.displayName.charAt(0)
          )}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">{pro.displayName}</h1>
            {pro.isVerified && (
              <Badge variant="success" className="gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Verificado
              </Badge>
            )}
          </div>
          {pro.headline && (
            <p className="mt-1 text-muted-foreground">{pro.headline}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Stars value={pro.ratingAverage} /> {pro.ratingAverage.toFixed(1)}{" "}
              ({pro.ratingCount})
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" /> {pro.completedJobs} serviços
              concluídos
            </span>
            {pro.yearsExperience ? (
              <span>{pro.yearsExperience} anos de experiência</span>
            ) : null}
          </div>
        </div>
        <Link href="/servicos">
          <Button size="lg">Pedir serviço</Button>
        </Link>
      </div>

      {pro.description && (
        <section>
          <h2 className="text-lg font-semibold">Sobre</h2>
          <p className="mt-2 text-muted-foreground">{pro.description}</p>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold">Serviços</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {pro.services.map((s) => (
            <Link
              key={s.service.slug}
              href={`/servicos/${s.service.category.slug}/${s.service.slug}`}
              className="rounded-full border bg-card px-3 py-1 text-sm hover:border-primary/40"
            >
              {s.service.name}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Áreas cobertas</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {pro.serviceAreas.map((a) => (
            <span
              key={a.id}
              className="flex items-center gap-1 rounded-full border bg-card px-3 py-1 text-sm"
            >
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              {a.municipality ?? a.district}
            </span>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Avaliações</h2>
        {pro.reviews.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Ainda sem avaliações.
          </p>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {pro.reviews.map((r) => (
              <ReviewCard
                key={r.id}
                review={{
                  rating: r.rating,
                  comment: r.comment,
                  createdAt: r.createdAt,
                  authorName: r.client.name,
                  serviceName: r.booking.service.name,
                }}
              />
            ))}
          </div>
        )}
      </section>

      <div className="rounded-2xl border bg-accent/40 p-6 text-center">
        <div className="flex justify-center gap-1 text-warm">
          <CheckCircle2 className="h-6 w-6 text-primary" />
        </div>
        <h2 className="mt-2 text-lg font-bold">Precisa de um serviço?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Escolha o serviço e marque online. Pode escolher {pro.displayName}{" "}
          durante a marcação.
        </p>
        <Link href="/servicos" className="mt-4 inline-block">
          <Button>Ver serviços</Button>
        </Link>
      </div>
    </div>
  );
}
