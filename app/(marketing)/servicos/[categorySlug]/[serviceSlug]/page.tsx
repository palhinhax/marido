import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Check, X, Star, PlusCircle, MapPin } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { FAQSection } from "@/components/seo/faq-section";
import { HowItWorks } from "@/components/seo/how-it-works";
import { RelatedServices } from "@/components/seo/related-services";
import { ServicePriceBox } from "@/components/seo/service-price-box";
import { MobileCTA } from "@/components/site/mobile-cta";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, faqJsonLd, serviceJsonLd } from "@/lib/seo";
import { euros } from "@/lib/format";
import { ALL_SERVICES, getServiceBySlug } from "@/lib/data/catalog";
import { getServiceCityLocations } from "@/lib/data/locations";

export function generateStaticParams() {
  return ALL_SERVICES.map((s) => ({
    categorySlug: s.category.slug,
    serviceSlug: s.slug,
  }));
}

export function generateMetadata({
  params,
}: {
  params: { serviceSlug: string };
}): Metadata {
  const service = getServiceBySlug(params.serviceSlug);
  if (!service) return {};
  const title = `${service.name} — preço e marcação online`;
  const description = service.shortDescription;
  return {
    title,
    description,
    keywords: [
      service.name.toLowerCase(),
      `${service.name.toLowerCase()} preço`,
      `${service.name.toLowerCase()} ao domicílio`,
      service.category.name.toLowerCase(),
      "marido de aluguer",
    ],
    alternates: {
      canonical: `/servicos/${service.category.slug}/${service.slug}`,
    },
    openGraph: { title, description },
  };
}

export default function ServicePage({
  params,
}: {
  params: { serviceSlug: string };
}) {
  const service = getServiceBySlug(params.serviceSlug);
  if (!service) notFound();

  const bookHref = `/marcar/${service.slug}`;
  const url = `/servicos/${service.category.slug}/${service.slug}`;
  const serviceCities = getServiceCityLocations();

  const crumbs = [
    { name: "Início", href: "/" },
    { name: "Serviços", href: "/servicos" },
    { name: service.category.name, href: `/servicos/${service.category.slug}` },
    { name: service.name, href: url },
  ];

  const related = service.category.services
    .filter((s) => s.slug !== service.slug)
    .slice(0, 3)
    .map((s) => ({
      name: s.name,
      slug: s.slug,
      categorySlug: service.category.slug,
      shortDescription: s.shortDescription,
      basePrice: s.basePrice,
      priceType: s.priceType,
      icon: service.category.icon,
    }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 pb-28 md:pb-10">
      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs),
          serviceJsonLd({
            name: service.name,
            description: service.shortDescription,
            url,
            price: service.basePrice,
          }),
          faqJsonLd(service.faqs),
        ]}
      />

      <Breadcrumbs crumbs={crumbs} />

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_360px]">
        {/* Main */}
        <div className="space-y-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {service.name}
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              {service.shortDescription}
            </p>
            <p className="mt-4 leading-relaxed">{service.description}</p>
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

          {/* Extras */}
          {service.extras.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold">Extras opcionais</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {service.extras.map((e) => (
                  <div
                    key={e.name}
                    className="flex items-center justify-between rounded-lg border bg-card px-4 py-3"
                  >
                    <span className="flex items-center gap-2 text-sm">
                      <PlusCircle className="h-4 w-4 text-primary" />
                      {e.name}
                    </span>
                    <span className="text-sm font-semibold text-primary">
                      +{euros(e.price)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <HowItWorks title="Como funciona a marcação" />

          {/* Reviews placeholder */}
          <section>
            <h2 className="text-2xl font-bold">Avaliações</h2>
            <div className="mt-4 rounded-xl border bg-card p-6 text-center">
              <div className="flex justify-center gap-1 text-warm">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Avaliações reais dos clientes aparecem aqui após cada serviço
                concluído. Seja dos primeiros a avaliar este serviço.
              </p>
            </div>
          </section>

          <FAQSection faqs={service.faqs} />

          <RelatedServices services={related} />
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

      {/* Price box on mobile, above locations */}
      <div className="mt-10 lg:hidden">
        <ServicePriceBox
          price={service.basePrice}
          priceType={service.priceType}
          durationMinutes={service.estimatedDurationMinutes}
          requiresPhotos={service.requiresPhotos}
          bookHref={bookHref}
        />
      </div>

      <div className="mt-16">
        <section>
          <h2 className="text-2xl font-bold">
            {service.name} — onde está disponível
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Marque {service.name.toLowerCase()} nas principais cidades, com
            preço definido e profissionais avaliados.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {serviceCities.map((c) => (
              <Link
                key={c.slug}
                href={`${url}/${c.slug}`}
                className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2.5 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
              >
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {service.name} em {c.name}
              </Link>
            ))}
          </div>
        </section>
      </div>

      <MobileCTA
        price={service.basePrice}
        priceType={service.priceType}
        bookHref={bookHref}
      />
    </div>
  );
}
