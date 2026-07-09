import type { Metadata } from "next";
import { FAQSection } from "@/components/seo/faq-section";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";

export const metadata: Metadata = {
  title: "Ajuda",
  description:
    "Centro de ajuda Vizinho — respostas às perguntas mais frequentes de clientes e profissionais.",
  alternates: { canonical: "/ajuda" },
};

const CLIENT_FAQS = [
  {
    question: "Como faço um pedido?",
    answer:
      "Escolha o serviço, indique a morada e o horário, descreva o que precisa e submeta. É gratuito e sem compromisso.",
  },
  {
    question: "Como cancelo um pedido?",
    answer:
      "Na sua área de cliente, em Pedidos, pode cancelar pedidos que ainda estejam pendentes.",
  },
  {
    question: "Quando pago?",
    answer:
      "O pagamento é combinado diretamente com o profissional. Estamos a preparar pagamentos online seguros para o futuro.",
  },
  {
    question: "Posso avaliar o profissional?",
    answer:
      "Sim. Após a conclusão do serviço, pode deixar uma avaliação e comentário.",
  },
];

const PRO_FAQS = [
  {
    question: "Como me registo como profissional?",
    answer:
      "Crie a conta de profissional, escolha serviços e zonas, defina a disponibilidade e aguarde a aprovação da equipa.",
  },
  {
    question: "Como defino a minha disponibilidade?",
    answer:
      "Na área de profissional, em Disponibilidade, marque as horas em que está disponível na grelha semanal.",
  },
  {
    question: "Como recebo pedidos?",
    answer:
      "Os pedidos na sua zona aparecem em Pedidos. Pode aceitar ou recusar cada um.",
  },
];

export default function AjudaPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-12 px-4 py-10">
      <div>
        <Breadcrumbs
          crumbs={[
            { name: "Início", href: "/" },
            { name: "Ajuda", href: "/ajuda" },
          ]}
        />
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Centro de ajuda
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Respostas às perguntas mais frequentes. Não encontra o que procura?
          Fale connosco através da página de contactos.
        </p>
      </div>
      <FAQSection faqs={CLIENT_FAQS} title="Para clientes" />
      <FAQSection faqs={PRO_FAQS} title="Para profissionais" />
    </div>
  );
}
