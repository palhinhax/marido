import type { Metadata } from "next";
import { CategoryCard } from "@/components/category-card";
import { ServiceCard } from "@/components/service-card";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { PopularLocations } from "@/components/seo/popular-locations";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";
import { CATALOG, ALL_SERVICES } from "@/lib/data/catalog";

export const metadata: Metadata = {
  title: "Serviços para casa em Portugal | Preços definidos",
  description:
    "Todos os serviços para casa num só lugar: reparações, canalização, eletricidade, montagens, pintura, casa inteligente e jardim. Marcação online com preços claros.",
  alternates: { canonical: "/servicos" },
};

export default function ServicesPage() {
  const crumbs = [
    { name: "Início", href: "/" },
    { name: "Serviços", href: "/servicos" },
  ];
  return (
    <div className="mx-auto max-w-6xl space-y-14 px-4 py-10">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <div>
        <Breadcrumbs crumbs={crumbs} />
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Serviços para casa
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Escolha uma categoria ou serviço, veja o preço à partida e marque
          online em minutos. Profissionais avaliados em todo o país.
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-bold">Categorias</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATALOG.map((c) => (
            <CategoryCard
              key={c.slug}
              category={{
                name: c.name,
                slug: c.slug,
                description: c.description,
                icon: c.icon,
                serviceCount: c.services.length,
              }}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold">Todos os serviços</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ALL_SERVICES.map((s) => (
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

      <PopularLocations />
    </div>
  );
}
