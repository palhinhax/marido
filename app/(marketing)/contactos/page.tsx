import type { Metadata } from "next";
import { Mail, Phone, MessageCircle } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contactos",
  description:
    "Fale com a equipa Vizinho. Apoio ao cliente e a profissionais em Portugal.",
  alternates: { canonical: "/contactos" },
};

export default function ContactosPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <div>
        <Breadcrumbs
          crumbs={[
            { name: "Início", href: "/" },
            { name: "Contactos", href: "/contactos" },
          ]}
        />
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Contactos
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Estamos aqui para ajudar, seja cliente ou profissional. Escolha a
          forma mais conveniente para falar connosco.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <a
          href={`mailto:${SITE.email}`}
          className="rounded-xl border bg-card p-5 hover:border-primary/40"
        >
          <Mail className="h-6 w-6 text-primary" />
          <h2 className="mt-3 font-semibold">Email</h2>
          <p className="mt-1 text-sm text-muted-foreground">{SITE.email}</p>
        </a>
        <a
          href={`tel:${SITE.phone.replace(/\s/g, "")}`}
          className="rounded-xl border bg-card p-5 hover:border-primary/40"
        >
          <Phone className="h-6 w-6 text-primary" />
          <h2 className="mt-3 font-semibold">Telefone</h2>
          <p className="mt-1 text-sm text-muted-foreground">{SITE.phone}</p>
        </a>
        <div className="rounded-xl border bg-card p-5">
          <MessageCircle className="h-6 w-6 text-primary" />
          <h2 className="mt-3 font-semibold">WhatsApp</h2>
          <p className="mt-1 text-sm text-muted-foreground">Em breve</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Horário de apoio: dias úteis, das 9h às 18h. Respondemos normalmente no
        próprio dia.
      </p>
    </div>
  );
}
