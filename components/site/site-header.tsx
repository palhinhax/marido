"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/site/logo-mark";
import { SITE } from "@/lib/site";
import { dashboardPathForRole } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/servicos", label: "Serviços" },
  { href: "/como-funciona", label: "Como funciona" },
  { href: "/para-profissionais", label: "Para profissionais" },
];

const ACCOUNT_LABEL: Record<string, string> = {
  ADMIN: "Administração",
  PROFESSIONAL: "Área de profissional",
  CLIENT: "A minha conta",
};

export function SiteHeader() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  const role = session?.user?.role;
  const dashHref = role ? dashboardPathForRole(role) : "/dashboard";
  const accountLabel = (role && ACCOUNT_LABEL[role]) || "A minha conta";
  const canSeeProfessionalCta =
    role === "CLIENT" || (!role && status !== "loading");
  const visibleNavLinks = navLinks.filter(
    (l) => l.href !== "/para-profissionais" || canSeeProfessionalCta
  );

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <LogoMark priority />
          {SITE.name}
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {visibleNavLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {session ? (
            <Link href={dashHref}>
              <Button variant="outline" size="sm">
                {accountLabel}
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Entrar
                </Button>
              </Link>
              <Link href="/servicos">
                <Button size="sm">Marcar serviço</Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div className={cn("border-t md:hidden", open ? "block" : "hidden")}>
        <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
          {visibleNavLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2 text-sm font-medium hover:bg-muted"
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-2 flex gap-2">
            {session ? (
              <Link
                href={dashHref}
                className="flex-1"
                onClick={() => setOpen(false)}
              >
                <Button variant="outline" className="w-full">
                  {accountLabel}
                </Button>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex-1"
                  onClick={() => setOpen(false)}
                >
                  <Button variant="outline" className="w-full">
                    Entrar
                  </Button>
                </Link>
                <Link
                  href="/servicos"
                  className="flex-1"
                  onClick={() => setOpen(false)}
                >
                  <Button className="w-full">Marcar serviço</Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
