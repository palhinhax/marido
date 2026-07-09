import Link from "next/link";
import {
  ShieldCheck,
  Tag,
  Headphones,
  Star,
  ArrowRight,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSearch } from "@/components/site/hero-search";
import { ServiceCard } from "@/components/service-card";
import { CategoryCard } from "@/components/category-card";
import { HowItWorks } from "@/components/seo/how-it-works";
import { FAQSection } from "@/components/seo/faq-section";
import { PopularLocations } from "@/components/seo/popular-locations";
import { CATALOG, getServiceBySlug } from "@/lib/data/catalog";

const POPULAR_SERVICE_SLUGS = [
  "montagem-de-moveis",
  "trocar-torneira",
  "instalar-candeeiro",
  "pendurar-quadros-e-prateleiras",
  "reparacao-de-estores",
  "pintar-uma-divisao",
];

const HOME_FAQS = [
  {
    question: "Como funcionam os preços?",
    answer:
      'A maioria dos serviços tem um preço à partida ("a partir de") ou preço fixo, indicado antes de marcar. Alguns serviços mais variáveis, como pintar uma divisão, são orçamentados após avaliação.',
  },
  {
    question: "Preciso de criar conta para marcar?",
    answer:
      "Pode começar o pedido sem conta. Antes de submeter, pedimos apenas os seus dados de contacto para o profissional o poder contactar.",
  },
  {
    question: "Os profissionais são de confiança?",
    answer:
      "Os profissionais registam-se, são aprovados pela nossa equipa e recebem avaliações reais de clientes após cada serviço concluído.",
  },
  {
    question: "Em que zonas está disponível?",
    answer:
      "Estamos a crescer em Portugal, com maior cobertura nas áreas metropolitanas de Lisboa e Porto e nos principais concelhos do país.",
  },
];

export default function HomePage() {
  const popular = POPULAR_SERVICE_SLUGS.map(getServiceBySlug).filter(
    (s): s is NonNullable<typeof s> => Boolean(s)
  );

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-accent/60 to-background">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <BadgeCheck className="h-4 w-4 text-primary" />
              Profissionais avaliados · Preços transparentes
            </span>
            <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              Serviços para casa em Portugal, marcados online
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Encontre profissionais para reparações, montagens, canalização,
              eletricidade, pintura, jardim e pequenos arranjos domésticos.
            </p>
          </div>
          <div className="mx-auto mt-8 max-w-3xl">
            <HeroSearch />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-20 px-4 py-16">
        {/* Popular services */}
        <section>
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-bold">Serviços populares</h2>
            <Link
              href="/servicos"
              className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex"
            >
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map((s) => (
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

        {/* Categories */}
        <section>
          <h2 className="text-2xl font-bold">Explore por categoria</h2>
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

        <HowItWorks />

        {/* Transparent pricing */}
        <section className="rounded-2xl border bg-accent/40 p-8 sm:p-10">
          <div className="grid items-center gap-6 sm:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold">
                Preços claros antes de marcar
              </h2>
              <p className="mt-3 text-muted-foreground">
                Nada de surpresas. A maioria dos serviços tem preço fixo ou
                &quot;a partir de&quot;, mostrado antes de confirmar. Os
                serviços mais variáveis são orçamentados após avaliação, sem
                compromisso.
              </p>
              <Link href="/servicos" className="mt-5 inline-block">
                <Button>Ver serviços e preços</Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Montagem de móveis", "A partir de 25€"],
                ["Trocar torneira", "A partir de 35€"],
                ["Instalar candeeiro", "A partir de 30€"],
                ["Pintar uma divisão", "Sob avaliação"],
              ].map(([name, price]) => (
                <div key={name} className="rounded-xl border bg-card p-4">
                  <p className="text-sm font-medium">{name}</p>
                  <p className="mt-1 text-sm font-bold text-primary">{price}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Professional CTA */}
        <section className="rounded-2xl bg-primary px-8 py-10 text-primary-foreground sm:px-10">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-bold">
                É profissional? Trabalhe connosco
              </h2>
              <p className="mt-2 max-w-xl text-primary-foreground/80">
                Tem experiência em reparações? Junte-se à plataforma, defina a
                sua disponibilidade e receba pedidos na sua zona.
              </p>
            </div>
            <Link href="/registar/profissional">
              <Button size="lg" variant="secondary" className="shrink-0">
                Tornar-me profissional
              </Button>
            </Link>
          </div>
        </section>

        <PopularLocations />

        {/* Trust */}
        <section>
          <h2 className="text-2xl font-bold">Porquê o Vizinho</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Star,
                title: "Profissionais avaliados",
                text: "Avaliações reais de clientes após cada serviço.",
              },
              {
                icon: Tag,
                title: "Preços transparentes",
                text: "Preço à partida ou fixo, mostrado antes de marcar.",
              },
              {
                icon: ShieldCheck,
                title: "Marcação segura",
                text: "Pedidos organizados e histórico sempre acessível.",
              },
              {
                icon: Headphones,
                title: "Suporte próximo",
                text: "Ajuda quando precisa, em português.",
              },
            ].map((t) => (
              <div key={t.title} className="rounded-xl border bg-card p-5">
                <t.icon className="h-6 w-6 text-primary" />
                <h3 className="mt-3 font-semibold">{t.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.text}</p>
              </div>
            ))}
          </div>
        </section>

        <FAQSection faqs={HOME_FAQS} />
      </div>
    </>
  );
}
