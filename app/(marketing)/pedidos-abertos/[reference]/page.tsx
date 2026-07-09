import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Home,
  Wrench,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  URGENCY_LABEL,
  PROPERTY_TYPE_LABEL,
  priceLabel,
  formatDate,
} from "@/lib/format";
import { isOpenRequest, openRequestPath } from "@/lib/share";
import { SITE, absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

// Only anonymized, non-personal fields are ever selected here.
async function getOpenRequest(reference: string) {
  return prisma.booking.findUnique({
    where: { reference },
    select: {
      reference: true,
      status: true,
      municipality: true,
      district: true,
      urgency: true,
      propertyType: true,
      scheduledStart: true,
      estimatedPrice: true,
      priceType: true,
      createdAt: true,
      service: {
        select: {
          name: true,
          slug: true,
          category: { select: { slug: true } },
        },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: { reference: string };
}): Promise<Metadata> {
  const b = await getOpenRequest(params.reference);
  if (!b) return { title: "Pedido não encontrado" };
  const title = `${b.service.name} em ${b.municipality} — pedido no ${SITE.name}`;
  const description = `Há um cliente em ${b.municipality} (${b.district}) à procura de um profissional para "${b.service.name}". Aceita o pedido no ${SITE.name}.`;
  return {
    title,
    description,
    // Transient pages: keep them out of the index but let Facebook read OG tags.
    robots: { index: false, follow: true },
    openGraph: {
      type: "website",
      title,
      description,
      url: absoluteUrl(openRequestPath(b.reference)),
      siteName: SITE.name,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function OpenRequestPage({
  params,
}: {
  params: { reference: string };
}) {
  const b = await getOpenRequest(params.reference);
  if (!b) notFound();

  const open = isOpenRequest(b.status);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="rounded-2xl border bg-card p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <Badge variant={open ? "warm" : "muted"}>
            {open ? "Pedido em aberto" : "Já atribuído"}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Publicado {formatDate(b.createdAt)}
          </span>
        </div>

        <div className="mt-4 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Wrench className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{b.service.name}</h1>
            <p className="mt-1 flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4" /> {b.municipality}, {b.district}
            </p>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
          <Item
            icon={Clock}
            label="Quando"
            value={
              b.scheduledStart ? formatDate(b.scheduledStart) : "A combinar"
            }
          />
          <Item
            icon={Home}
            label="Imóvel"
            value={PROPERTY_TYPE_LABEL[b.propertyType]}
          />
          <Item
            icon={Clock}
            label="Urgência"
            value={URGENCY_LABEL[b.urgency]}
          />
          <Item
            icon={Wrench}
            label="Preço de referência"
            value={priceLabel(b.estimatedPrice, b.priceType)}
          />
        </dl>

        <p className="mt-4 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          Os dados de contacto do cliente só são partilhados com o profissional
          que aceita o pedido.
        </p>

        {open ? (
          <div className="mt-6 space-y-3">
            <h2 className="font-semibold">
              É profissional? Fique com este trabalho
            </h2>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link href="/profissional/pedidos" className="flex-1">
                <Button className="w-full">
                  Aceitar no Vizinho <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/registar/profissional" className="flex-1">
                <Button variant="outline" className="w-full">
                  Ainda não sou profissional
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-lg border bg-accent/40 p-4 text-center text-sm">
            <CheckCircle2 className="mx-auto h-6 w-6 text-primary" />
            <p className="mt-2">
              Este pedido já foi atribuído. Veja outros{" "}
              <Link href="/servicos" className="text-primary hover:underline">
                serviços disponíveis
              </Link>
              .
            </p>
          </div>
        )}
      </div>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Precisa de um serviço para casa?{" "}
        <Link
          href={`/servicos/${b.service.category.slug}/${b.service.slug}`}
          className="text-primary hover:underline"
        >
          Marque {b.service.name.toLowerCase()}
        </Link>
      </p>
    </div>
  );
}

function Item({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border p-3">
      <dt className="flex items-center gap-1 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}
