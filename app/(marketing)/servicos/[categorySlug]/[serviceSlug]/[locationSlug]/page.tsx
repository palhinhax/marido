import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Check, X, MapPin } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { FAQSection } from "@/components/seo/faq-section";
import { HowItWorks } from "@/components/seo/how-it-works";
import { ServicePriceBox } from "@/components/seo/service-price-box";
import { MobileCTA } from "@/components/site/mobile-cta";
import { JsonLd } from "@/components/seo/json-ld";
import {
  breadcrumbJsonLd,
  faqJsonLd,
  localBusinessJsonLd,
  serviceJsonLd,
} from "@/lib/seo";
import {
  ALL_SERVICES,
  getServiceBySlug,
  formatPrice,
} from "@/lib/data/catalog";
import {
  getLocationBySlug,
  getServiceCityLocations,
} from "@/lib/data/locations";

// Only the curated big-city set gets service-level location pages — anything
// else 404s instead of generating thin, near-duplicate content.
export const dynamicParams = false;

export function generateStaticParams() {
  const cities = getServiceCityLocations();
  return ALL_SERVICES.flatMap((s) =>
    cities.map((loc) => ({
      categorySlug: s.category.slug,
      serviceSlug: s.slug,
      locationSlug: loc.slug,
    }))
  );
}

export function generateMetadata({
  params,
}: {
  params: { serviceSlug: string; locationSlug: string };
}): Metadata {
  const service = getServiceBySlug(params.serviceSlug);
  const loc = getLocationBySlug(params.locationSlug);
  if (!service || !loc) return {};
  const priceStr =
    service.basePrice !== null
      ? ` a partir de ${formatPrice(service.basePrice, service.priceType)}`
      : "";
  const title = `${service.name} em ${loc.name}`;
  const description = `${service.name} em ${loc.name}${priceStr}. ${service.shortDescription} Marcação online com profissionais avaliados em ${loc.name} e no distrito de ${loc.district.name}.`;
  return {
    title,
    description,
    keywords: [
      `${service.name.toLowerCase()} ${loc.name.toLowerCase()}`,
      `${service.name.toLowerCase()} ${loc.name.toLowerCase()} preço`,
      `${service.name.toLowerCase()} ao domicílio ${loc.name.toLowerCase()}`,
      `marido de aluguer ${loc.name.toLowerCase()}`,
    ],
    alternates: {
      canonical: `/servicos/${service.category.slug}/${service.slug}/${loc.slug}`,
    },
    openGraph: { title, description },
  };
}

export default function ServiceLocationPage({
  params,
}: {
  params: { serviceSlug: string; locationSlug: string };
}) {
  const service = getServiceBySlug(params.serviceSlug);
  const loc = getLocationBySlug(params.locationSlug);
  if (!service || !loc) notFound();

  const bookHref = `/marcar/${service.slug}`;
  const nationalUrl = `/servicos/${service.category.slug}/${service.slug}`;
  const url = `${nationalUrl}/${loc.slug}`;

  const crumbs = [
    { name: "Início", href: "/" },
    { name: "Serviços", href: "/servicos" },
    { name: service.category.name, href: `/servicos/${service.category.slug}` },
    { name: service.name, href: nationalUrl },
    { name: loc.name, href: url },
  ];

  const faqs = [
    {
      question: `Quanto custa ${service.name.toLowerCase()} em ${loc.name}?`,
      answer:
        service.priceType === "QUOTE" || service.basePrice === null
          ? `Em ${loc.name}, este serviço é orçamentado após avaliação, sem compromisso. O preço depende da dimensão e complexidade do trabalho.`
          : `Em ${loc.name}, ${service.name.toLowerCase()} custa ${formatPrice(
              service.basePrice,
              service.priceType
            ).toLowerCase()}. O valor final pode variar consoante os materiais e as condições no local.`,
    },
    {
      question: `Com que rapidez tenho ${service.name.toLowerCase()} em ${loc.name}?`,
      answer: `Temos profissionais avaliados a cobrir ${loc.name} e o distrito de ${loc.district.name}. Ao marcar, escolhe o horário e recebe resposta de um profissional disponível na sua zona.`,
    },
    {
      question: "Os materiais estão incluídos no preço?",
      answer:
        "O preço refere-se à mão de obra e pequeno material de fixação. Materiais específicos (peças, torneiras, tinta, candeeiros) são pagos à parte ou fornecidos por si.",
    },
  ];

  // Same service in the other big cities — keyword-rich internal linking.
  const otherCities = getServiceCityLocations().filter(
    (c) => c.slug !== loc.slug
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 pb-28 md:pb-10">
      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs),
          serviceJsonLd({
            name: `${service.name} em ${loc.name}`,
            description: service.shortDescription,
            url,
            price: service.basePrice,
            areaServed: loc.name,
          }),
          localBusinessJsonLd({
            name: `${service.name} em ${loc.name} — Vizinho`,
            description: service.shortDescription,
            url,
            areaServed: loc.name,
          }),
          faqJsonLd(faqs),
        ]}
      />

      <Breadcrumbs crumbs={crumbs} />

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_360px]">
        {/* Main */}
        <div className="space-y-12">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <MapPin className="h-4 w-4" /> {loc.name}, {loc.district.name}
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              {service.name} em {loc.name}
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              {service.shortDescription}
            </p>
            <p className="mt-4 leading-relaxed">
              {service.description} Em {loc.name}, marque online e receba um
              profissional avaliado, com preço definido antes de confirmar.
            </p>
          </div>

          {/* Included / not included */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border bg-card p-5">
              <h2 className="font-semibold">O que está incluído</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {service.included.map((i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span>{i}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border bg-card p-5">
              <h2 className="font-semibold">O que não está incluído</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {service.notIncluded.map((i) => (
                  <li key={i} className="flex items-start gap-2">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-muted-foreground">{i}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <HowItWorks title="Como funciona a marcação" />

          <FAQSection faqs={faqs} />

          {/* Same service, other cities */}
          <section>
            <h2 className="text-2xl font-bold">
              {service.name} noutras cidades
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {otherCities.map((c) => (
                <Link
                  key={c.slug}
                  href={`${nationalUrl}/${c.slug}`}
                  className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2.5 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {c.name}
                </Link>
              ))}
            </div>
            <div className="mt-4">
              <Link
                href={nationalUrl}
                className="text-sm font-medium text-primary hover:underline"
              >
                Ver {service.name.toLowerCase()} em todo o Portugal →
              </Link>
            </div>
          </section>
        </div>

        {/* Sidebar price box */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <ServicePriceBox
              price={service.basePrice}
              priceType={service.priceType}
              durationMinutes={service.estimatedDurationMinutes}
              requiresPhotos={service.requiresPhotos}
              bookHref={bookHref}
            />
          </div>
        </aside>
      </div>

      {/* Price box on mobile */}
      <div className="mt-10 lg:hidden">
        <ServicePriceBox
          price={service.basePrice}
          priceType={service.priceType}
          durationMinutes={service.estimatedDurationMinutes}
          requiresPhotos={service.requiresPhotos}
          bookHref={bookHref}
        />
      </div>

      <MobileCTA
        price={service.basePrice}
        priceType={service.priceType}
        bookHref={bookHref}
      />
    </div>
  );
}
