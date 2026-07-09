import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarClock,
  MapPinned,
  Wallet,
  Star,
  CheckCircle2,
  Euro,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FAQSection } from "@/components/seo/faq-section";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { getCurrentUser, dashboardPathForRole } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Para profissionais — trabalhe connosco",
  description:
    "Tem experiência em reparações, canalização, eletricidade, montagens ou pintura? Junte-se ao Vizinho, defina a sua disponibilidade e receba pedidos na sua zona.",
  alternates: { canonical: "/para-profissionais" },
};

const BENEFITS = [
  {
    icon: CalendarClock,
    title: "Gerir a sua agenda",
    text: "Defina a sua disponibilidade numa grelha semanal simples e bloqueie os dias que quiser.",
  },
  {
    icon: MapPinned,
    title: "Escolher as suas zonas",
    text: "Receba apenas pedidos nos distritos e concelhos onde trabalha.",
  },
  {
    icon: Wallet,
    title: "Estimativa de ganhos",
    text: "Acompanhe os pedidos aceites e uma estimativa dos seus ganhos.",
  },
  {
    icon: Star,
    title: "Construir reputação",
    text: "Receba avaliações reais e destaque-se junto de novos clientes.",
  },
];

const STEPS = [
  "Crie a sua conta e o perfil profissional",
  "Escolha os serviços que faz e as suas zonas",
  "Defina a disponibilidade na grelha semanal",
  "Envie documentos para verificação (opcional)",
  "Após aprovação, comece a receber pedidos",
];

const FAQS = [
  {
    question: "Quanto custa juntar-me à plataforma?",
    answer:
      "O registo é gratuito. Estamos a construir o modelo de comissões de forma transparente e comunicaremos qualquer condição antes de aplicar.",
  },
  {
    question: "Preciso de ter empresa ou recibos verdes?",
    answer:
      "Deve ser um profissional legalmente habilitado a prestar o serviço. Pode indicar NIF e nome de empresa no perfil, mas não é obrigatório no MVP.",
  },
  {
    question: "Como recebo os pedidos?",
    answer:
      "Os pedidos aparecem na sua área de profissional. Pode aceitar ou recusar, e gerir os trabalhos aceites e a sua agenda.",
  },
];

export default async function ParaProfissionaisPage() {
  const user = await getCurrentUser();
  if (user?.role === "PROFESSIONAL" || user?.role === "ADMIN") {
    redirect(dashboardPathForRole(user.role));
  }

  return (
    <div className="mx-auto max-w-5xl space-y-14 px-4 py-10">
      <section className="rounded-2xl bg-primary px-6 py-12 text-primary-foreground sm:px-10">
        <Breadcrumbs
          crumbs={[
            { name: "Início", href: "/" },
            { name: "Para profissionais", href: "/para-profissionais" },
          ]}
        />
        <h1 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          Tem experiência em reparações? Junte-se à plataforma
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-primary-foreground/80">
          Receba pedidos de clientes na sua zona, defina a sua disponibilidade e
          faça crescer o seu negócio com o Vizinho.
        </p>
        <Link href="/registar/profissional" className="mt-6 inline-block">
          <Button size="lg" variant="secondary">
            Tornar-me profissional
          </Button>
        </Link>
      </section>

      {/* Earnings example */}
      <section className="rounded-2xl border bg-card p-6 sm:p-8">
        <div className="grid items-center gap-8 sm:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold">Quanto pode ganhar?</h2>
            <p className="mt-3 text-muted-foreground">
              Os preços são definidos por serviço e o valor é seu. Um exemplo
              realista de um dia de trabalho:
            </p>
            <div className="mt-5 rounded-xl border bg-accent/40 p-5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Euro className="h-4 w-4 text-primary" />3 serviços num dia ×
                35€ em média
              </div>
              <p className="mt-1 text-3xl font-bold text-primary">105€/dia</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Exemplo ilustrativo. Os valores variam consoante os serviços, a
                zona e a sua disponibilidade.
              </p>
            </div>
          </div>
          <ul className="space-y-3">
            {[
              "Registo gratuito, sem mensalidade inicial",
              "Receba pedidos apenas perto de si",
              "Escolha os serviços, as zonas e os horários",
              "Ideal para faz-tudo, canalizadores, eletricistas, montadores, pintores e jardineiros",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold">Vantagens</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b) => (
            <div key={b.title} className="rounded-xl border bg-card p-5">
              <b.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-semibold">{b.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-6 sm:p-8">
        <h2 className="text-2xl font-bold">Como começar</h2>
        <ol className="mt-6 space-y-3">
          {STEPS.map((s, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {i + 1}
              </span>
              <span className="pt-0.5">{s}</span>
            </li>
          ))}
        </ol>
        <Link href="/registar/profissional" className="mt-6 inline-flex">
          <Button>
            <CheckCircle2 className="mr-2 h-4 w-4" /> Criar conta de
            profissional
          </Button>
        </Link>
      </section>

      <FAQSection faqs={FAQS} />
    </div>
  );
}
