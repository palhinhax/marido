import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, ShieldCheck, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/service-card";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { FAQSection } from "@/components/seo/faq-section";
import { HowItWorks } from "@/components/seo/how-it-works";
import { JsonLd } from "@/components/seo/json-ld";
import {
  breadcrumbJsonLd,
  faqJsonLd,
  localBusinessJsonLd,
  serviceJsonLd,
} from "@/lib/seo";
import {
  SEO_ROLES,
  getSeoRole,
  getCategoryBySlug,
  ALL_SERVICES,
} from "@/lib/data/catalog";
import { ALL_MUNICIPALITIES, getLocationBySlug } from "@/lib/data/locations";

// role × location combinations
export function generateStaticParams() {
  return SEO_ROLES.flatMap((role) =>
    ALL_MUNICIPALITIES.map((loc) => ({
      roleSlug: role.slug,
      locationSlug: loc.slug,
    }))
  );
}

function servicesForRole(roleSlug: string) {
  const role = getSeoRole(roleSlug);
  if (!role) return [];
  if (role.categorySlug) {
    const cat = getCategoryBySlug(role.categorySlug);
    return cat ? cat.services.map((s) => ({ ...s, category: cat })) : [];
  }
  // cross-category (marido de aluguer / serviços domésticos): a curated mix
  const picks = [
    "montagem-de-moveis",
    "trocar-torneira",
    "instalar-candeeiro",
    "pendurar-quadros-e-prateleiras",
    "reparacao-de-estores",
    "tapar-furos",
  ];
  return picks
    .map((slug) => ALL_SERVICES.find((s) => s.slug === slug))
    .filter((s): s is (typeof ALL_SERVICES)[number] => Boolean(s));
}

export function generateMetadata({
  params,
}: {
  params: { roleSlug: string; locationSlug: string };
}): Metadata {
  const role = getSeoRole(params.roleSlug);
  const loc = getLocationBySlug(params.locationSlug);
  if (!role || !loc) return {};
  const title = `${role.h1} em ${loc.name} | Reparações em Casa com Preço Definido`;
  const description = `Peça serviços de ${role.label.toLowerCase()} em ${loc.name}. ${role.intro} Marcação online rápida com profissionais avaliados.`;
  return {
    title,
    description,
    alternates: { canonical: `/${role.slug}/${loc.slug}` },
    openGraph: { title, description },
  };
}

export default function RoleLocationPage({
  params,
}: {
  params: { roleSlug: string; locationSlug: string };
}) {
  const role = getSeoRole(params.roleSlug);
  const loc = getLocationBySlug(params.locationSlug);
  if (!role || !loc) notFound();

  const services = servicesForRole(role.slug);
  const url = `/${role.slug}/${loc.slug}`;

  const crumbs = [
    { name: "Início", href: "/" },
    {
      name: role.label,
      href: `/${role.slug}/${loc.district.slug === loc.slug ? loc.slug : loc.district.slug}`,
    },
    { name: loc.name, href: url },
  ];

  // nearby municipalities in the same district for internal linking
  const nearby = loc.district.municipalities.filter((m) => m.slug !== loc.slug);

  const faqs = [
    {
      question: `Quanto custa ${role.label.toLowerCase()} em ${loc.name}?`,
      answer:
        "A maioria dos serviços tem um preço à partida indicado antes de marcar. O valor final pode variar consoante a complexidade e os materiais. Serviços mais variáveis são orçamentados após avaliação.",
    },
    {
      question: `Com que rapidez encontro um profissional em ${loc.name}?`,
      answer: `Temos profissionais avaliados a cobrir ${loc.name} e o distrito de ${loc.district.name}. Ao marcar, escolhe o horário e recebe resposta de um profissional disponível.`,
    },
    {
      question: "Posso marcar para o próprio dia?",
      answer:
        "Sim. Ao criar o pedido pode indicar a urgência (normal, urgente ou hoje, se possível) e ver os horários disponíveis.",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-14 px-4 py-10">
      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs),
          localBusinessJsonLd({
            name: `${role.label} em ${loc.name} — Vizinho`,
            description: role.intro,
            url,
            areaServed: loc.name,
          }),
          serviceJsonLd({
            name: `${role.label} em ${loc.name}`,
            description: role.intro,
            url,
            price: services[0]?.basePrice ?? null,
            areaServed: loc.name,
          }),
          faqJsonLd(faqs),
        ]}
      />

      {/* Hero */}
      <section className="rounded-2xl border bg-gradient-to-b from-accent/60 to-card p-6 sm:p-10">
        <Breadcrumbs crumbs={crumbs} />
        <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
          <MapPin className="h-4 w-4" /> {loc.name}, {loc.district.name}
        </div>
        <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          {role.h1} em {loc.name}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
          {role.intro}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={
              role.categorySlug ? `/servicos/${role.categorySlug}` : "/servicos"
            }
          >
            <Button size="lg">Marcar serviço em {loc.name}</Button>
          </Link>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-primary" /> Avaliados
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-primary" /> Resposta rápida
            </span>
          </div>
        </div>
      </section>

      {/* Services */}
      <section>
        <h2 className="text-2xl font-bold">
          Serviços de {role.label.toLowerCase()} em {loc.name}
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <ServiceCard
              key={s.slug}
              service={{
                name: s.name,
                slug: s.slug,
                categorySlug: s.category.slug,
                shortDescription: s.shortDescription,
                basePrice: s.basePrice,
                priceType: s.priceType,
                icon: s.category.icon,
              }}
            />
          ))}
        </div>
      </section>

      <HowItWorks />

      {/* Local trust */}
      <section className="rounded-2xl border bg-card p-6 sm:p-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-0.5 text-warm">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-current" />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Profissionais avaliados por clientes em {loc.district.name}
            </p>
          </div>
          <Link
            href={
              role.categorySlug ? `/servicos/${role.categorySlug}` : "/servicos"
            }
          >
            <Button variant="outline">Ver todos os serviços</Button>
          </Link>
        </div>
      </section>

      {/* Nearby locations */}
      {nearby.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold">
            {role.label} noutras localidades
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {nearby.map((m) => (
              <Link
                key={m.slug}
                href={`/${role.slug}/${m.slug}`}
                className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2.5 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
              >
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {m.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <FAQSection faqs={faqs} />
    </div>
  );
}
