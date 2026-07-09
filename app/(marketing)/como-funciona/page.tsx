import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HowItWorks } from "@/components/seo/how-it-works";
import { FAQSection } from "@/components/seo/faq-section";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";

export const metadata: Metadata = {
  title: "Como funciona",
  description:
    "Saiba como marcar um serviço para casa no Vizinho: escolha o serviço, indique a morada e o horário, e receba um profissional avaliado.",
  alternates: { canonical: "/como-funciona" },
};

const FAQS = [
  {
    question: "Tenho de pagar para marcar?",
    answer:
      "Não. Fazer um pedido é gratuito e sem compromisso. O pagamento é combinado diretamente com o profissional.",
  },
  {
    question: "Posso cancelar ou reagendar?",
    answer:
      "Sim. Enquanto o pedido estiver pendente pode cancelar ou pedir reagendamento a partir da sua área de cliente.",
  },
  {
    question: "E se o serviço precisar de orçamento?",
    answer:
      "Alguns serviços mais variáveis são orçamentados após avaliação. Nesse caso recebe uma estimativa antes de avançar.",
  },
];

export default function ComoFuncionaPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-12 px-4 py-10">
      <div>
        <Breadcrumbs
          crumbs={[
            { name: "Início", href: "/" },
            { name: "Como funciona", href: "/como-funciona" },
          ]}
        />
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Como funciona
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Marcar um serviço para casa é simples e rápido. Escolha o serviço,
          indique a morada e o horário, e um profissional avaliado trata do
          resto.
        </p>
      </div>

      <HowItWorks title="Em 3 passos" />

      <section className="rounded-2xl border bg-accent/40 p-6 sm:p-8">
        <h2 className="text-xl font-bold">Preços claros, sem surpresas</h2>
        <p className="mt-2 text-muted-foreground">
          A maioria dos serviços tem preço fixo ou &quot;a partir de&quot;,
          indicado antes de marcar. O valor final pode variar consoante a
          complexidade, os materiais e a deslocação — mas nunca sem o seu
          acordo.
        </p>
        <Link href="/servicos" className="mt-4 inline-block">
          <Button>Ver serviços</Button>
        </Link>
      </section>

      <FAQSection faqs={FAQS} />
    </div>
  );
}
