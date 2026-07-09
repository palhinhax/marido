import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Como o Vizinho recolhe e trata os seus dados pessoais.",
  alternates: { canonical: "/privacidade" },
};

const SECTIONS: { title: string; body: string }[] = [
  {
    title: "1. Dados que recolhemos",
    body: "Recolhemos os dados que nos fornece ao criar conta ou marcar um serviço: nome, email, telefone, morada do serviço e descrição do pedido. Os profissionais fornecem ainda dados de perfil e, opcionalmente, documentos de verificação.",
  },
  {
    title: "2. Como usamos os dados",
    body: "Utilizamos os seus dados para processar pedidos, ligar clientes a profissionais, comunicar atualizações e melhorar o serviço. Não vendemos os seus dados a terceiros.",
  },
  {
    title: "3. Partilha com profissionais",
    body: "Ao submeter um pedido, os dados necessários (contacto e local do serviço) são partilhados com o profissional para que possa realizar o trabalho.",
  },
  {
    title: "4. Os seus direitos",
    body: "Pode aceder, corrigir ou eliminar os seus dados, bem como opor-se ao tratamento, nos termos do RGPD. Para exercer estes direitos, contacte-nos.",
  },
  {
    title: "5. Contacto",
    body: `Para questões de privacidade, contacte ${SITE.email}.`,
  },
];

export default function PrivacidadePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <div>
        <Breadcrumbs
          crumbs={[
            { name: "Início", href: "/" },
            { name: "Privacidade", href: "/privacidade" },
          ]}
        />
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Política de Privacidade
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Última atualização: {new Date().getFullYear()}. Documento de MVP, a
          consolidar com aconselhamento jurídico.
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
