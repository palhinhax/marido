import Link from "next/link";
import { Wrench } from "lucide-react";
import { RegisterForm } from "@/components/auth/register-form";
import { SITE } from "@/lib/site";

export const metadata = { title: "Criar conta" };

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-6 flex items-center justify-center gap-2 text-xl font-bold"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wrench className="h-4 w-4" />
          </span>
          {SITE.name}
        </Link>
        <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold">Criar conta</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Crie a sua conta para marcar e acompanhar serviços.
          </p>
          <div className="mt-6">
            <RegisterForm role="CLIENT" redirectTo="/dashboard" />
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
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Quer prestar serviços?{" "}
          <Link
            href="/registar/profissional"
            className="text-primary hover:underline"
          >
            Criar conta de profissional
          </Link>
        </p>
      </div>
    </div>
  );
}
