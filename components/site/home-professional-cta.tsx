"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

// Role-aware homepage CTA: recruits new professionals, but for someone who is
// already a professional it links to their panel instead.
export function HomeProfessionalCTA() {
  const { data: session } = useSession();
  const role = session?.user?.role;

  if (role === "PROFESSIONAL") {
    return (
      <section className="rounded-2xl bg-primary px-8 py-10 text-primary-foreground sm:px-10">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold">Bem-vindo de volta</h2>
            <p className="mt-2 max-w-xl text-primary-foreground/80">
              Gira a sua disponibilidade, veja pedidos na sua zona e acompanhe
              os seus trabalhos.
            </p>
          </div>
          <Link href="/profissional">
            <Button size="lg" variant="secondary" className="shrink-0">
              Ir para o meu painel
            </Button>
          </Link>
        </div>
      </section>
    );
  }

  // Admins don't need the recruitment pitch.
  if (role === "ADMIN") return null;

  return (
    <section className="rounded-2xl bg-primary px-8 py-10 text-primary-foreground sm:px-10">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">
            É profissional? Trabalhe connosco
          </h2>
          <p className="mt-2 max-w-xl text-primary-foreground/80">
            Tem experiência em reparações? Junte-se à plataforma, defina a sua
            disponibilidade e receba pedidos na sua zona.
          </p>
        </div>
        <Link href="/registar/profissional">
          <Button size="lg" variant="secondary" className="shrink-0">
            Tornar-me profissional
          </Button>
        </Link>
      </div>
    </section>
  );
}
