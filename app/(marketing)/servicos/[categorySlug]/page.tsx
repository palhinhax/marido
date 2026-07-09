import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceCard } from "@/components/service-card";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { HowItWorks } from "@/components/seo/how-it-works";
import { PopularLocations } from "@/components/seo/popular-locations";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";
import { CATALOG, getCategoryBySlug } from "@/lib/data/catalog";

export function generateStaticParams() {
  return CATALOG.map((c) => ({ categorySlug: c.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { categorySlug: string };
}): Metadata {
  const category = getCategoryBySlug(params.categorySlug);
  if (!category) return {};
  return {
    title: category.seoTitle,
    description: category.seoDescription,
    alternates: { canonical: `/servicos/${category.slug}` },
    openGraph: {
      title: category.seoTitle,
      description: category.seoDescription,
    },
  };
}

export default function CategoryPage({
  params,
}: {
  params: { categorySlug: string };
}) {
  const category = getCategoryBySlug(params.categorySlug);
  if (!category) notFound();

  const crumbs = [
    { name: "Início", href: "/" },
    { name: "Serviços", href: "/servicos" },
    { name: category.name, href: `/servicos/${category.slug}` },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-14 px-4 py-10">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <div>
        <Breadcrumbs crumbs={crumbs} />
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          {category.name}
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          {category.description}
        </p>
      </div>

      <section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {category.services.map((s) => (
            <ServiceCard
              key={s.slug}
              service={{
                name: s.name,
                slug: s.slug,
                categorySlug: category.slug,
                shortDescription: s.shortDescription,
                basePrice: s.basePrice,
                priceType: s.priceType,
                icon: category.icon,
              }}
            />
          ))}
        </div>
      </section>

      <HowItWorks />
      <PopularLocations roleSlug={category.professionalRole} />
    </div>
  );
}
