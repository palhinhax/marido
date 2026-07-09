import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Termos e Condições",
  description: "Termos e condições de utilização da plataforma Vizinho.",
  alternates: { canonical: "/termos" },
};

const SECTIONS: { title: string; body: string }[] = [
  {
    title: "1. A plataforma",
    body: `O ${SITE.name} é uma plataforma que liga clientes a profissionais independentes de serviços para casa. O ${SITE.name} não presta diretamente os serviços; apenas facilita o contacto e a marcação.`,
  },
  {
    title: "2. Responsabilidade dos profissionais",
    body: "Os profissionais são prestadores independentes e responsáveis pelo trabalho que realizam, pela sua qualidade, segurança e cumprimento das obrigações legais e fiscais aplicáveis.",
  },
  {
    title: "3. Preços e orçamentos",
    body: "Os preços apresentados são indicativos (fixos ou 'a partir de') e podem variar consoante a complexidade, os materiais e a deslocação. Alguns serviços são orçamentados após avaliação. O valor final é acordado entre cliente e profissional.",
  },
  {
    title: "4. Informação do cliente",
    body: "O cliente compromete-se a fornecer informação verdadeira e completa sobre o serviço pretendido e o local, de forma a permitir uma boa execução do trabalho.",
  },
  {
    title: "5. Marcações e cancelamentos",
    body: "Os pedidos podem ser cancelados enquanto estiverem pendentes. Após aceitação, cancelamentos e reagendamentos devem ser combinados com o profissional.",
  },
  {
    title: "6. Limitação de responsabilidade",
    body: `O ${SITE.name} não é parte no contrato de prestação de serviços entre cliente e profissional e não se responsabiliza por danos resultantes da execução dos serviços, sem prejuízo dos direitos do consumidor previstos na lei.`,
  },
];

export default function TermosPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <div>
        <Breadcrumbs
          crumbs={[
            { name: "Início", href: "/" },
            { name: "Termos", href: "/termos" },
          ]}
        />
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Termos e Condições
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Última atualização: {new Date().getFullYear()}. Este é um documento de
          MVP e não substitui aconselhamento jurídico.
        </p>
      </div>
      <div className="space-y-6">
        {SECTIONS.map((s) => (
          <section key={s.title}>
            <h2 className="text-lg font-semibold">{s.title}</h2>
            <p className="mt-2 text-muted-foreground">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
