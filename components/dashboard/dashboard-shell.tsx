"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Wrench,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  ListChecks,
  MapPinned,
  Star,
  UserCircle,
  Users,
  FolderTree,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

export type DashboardArea = "client" | "professional" | "admin";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

const NAV: Record<DashboardArea, NavItem[]> = {
  client: [
    { href: "/dashboard", label: "Início", icon: LayoutDashboard, exact: true },
    {
      href: "/dashboard/pedidos",
      label: "Os meus pedidos",
      icon: ClipboardList,
    },
    { href: "/dashboard/perfil", label: "Perfil", icon: UserCircle },
  ],
  professional: [
    {
      href: "/profissional",
      label: "Painel",
      icon: LayoutDashboard,
      exact: true,
    },
    { href: "/profissional/pedidos", label: "Pedidos", icon: ClipboardList },
    {
      href: "/profissional/disponibilidade",
      label: "Disponibilidade",
      icon: CalendarDays,
    },
    { href: "/profissional/servicos", label: "Serviços", icon: ListChecks },
    { href: "/profissional/areas", label: "Áreas", icon: MapPinned },
    { href: "/profissional/avaliacoes", label: "Avaliações", icon: Star },
    { href: "/profissional/perfil", label: "Perfil", icon: UserCircle },
  ],
  admin: [
    { href: "/admin", label: "Painel", icon: LayoutDashboard, exact: true },
    { href: "/admin/pedidos", label: "Pedidos", icon: ClipboardList },
    { href: "/admin/profissionais", label: "Profissionais", icon: ShieldCheck },
    { href: "/admin/clientes", label: "Clientes", icon: Users },
    { href: "/admin/servicos", label: "Serviços", icon: ListChecks },
    { href: "/admin/categorias", label: "Categorias", icon: FolderTree },
    { href: "/admin/avaliacoes", label: "Avaliações", icon: Star },
  ],
};

const AREA_LABEL: Record<DashboardArea, string> = {
  client: "Área de cliente",
  professional: "Área de profissional",
  admin: "Administração",
};

export function DashboardShell({
  area,
  children,
}: {
  area: DashboardArea;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const items = NAV[area];

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="flex h-14 items-center gap-3 px-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Wrench className="h-4 w-4" />
            </span>
            <span className="hidden sm:inline">{SITE.name}</span>
          </Link>
          <span className="hidden text-sm text-muted-foreground sm:inline">
            · {AREA_LABEL[area]}
          </span>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {session?.user?.name || session?.user?.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="mr-2 h-4 w-4" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        {/* Sidebar */}
        {open && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 transform border-r bg-background pt-14 transition-transform lg:sticky lg:top-14 lg:z-0 lg:h-[calc(100vh-3.5rem)] lg:translate-x-0 lg:pt-0",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <nav className="space-y-1 p-3">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive(item)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
