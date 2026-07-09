import Link from "next/link";
import { Wrench, CheckCircle2 } from "lucide-react";
import { RegisterForm } from "@/components/auth/register-form";
import { SITE } from "@/lib/site";

export const metadata = { title: "Registo de profissional" };

const PERKS = [
  "Receba pedidos na sua zona",
  "Defina a sua disponibilidade",
  "Construa reputação com avaliações",
];

export default function RegisterProfessionalPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-4xl gap-8 lg:grid-cols-2">
        {/* Pitch */}
        <div className="hidden flex-col justify-center lg:flex">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Wrench className="h-4 w-4" />
            </span>
            {SITE.name}
          </Link>
          <h2 className="mt-6 text-3xl font-bold">Trabalhe connosco</h2>
          <p className="mt-3 text-muted-foreground">
            Junte-se aos profissionais do {SITE.name} e comece a receber pedidos
            de clientes perto de si.
          </p>
          <ul className="mt-6 space-y-3">
            {PERKS.map((p) => (
              <li key={p} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* Form */}
        <div>
          <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
            <h1 className="text-2xl font-bold">Criar conta de profissional</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Comece o registo. A seguir configura o perfil e a disponibilidade.
            </p>
            <div className="mt-6">
              <RegisterForm
                role="PROFESSIONAL"
                redirectTo="/profissional/onboarding"
              />
            </div>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Já tem conta?{" "}
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
