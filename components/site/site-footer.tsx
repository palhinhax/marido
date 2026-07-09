import Link from "next/link";
import { Wrench } from "lucide-react";
import { SITE } from "@/lib/site";
import { CATALOG } from "@/lib/data/catalog";
import { getPopularLocations } from "@/lib/data/locations";

export function SiteFooter() {
  const locations = getPopularLocations().slice(0, 6);
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Wrench className="h-4 w-4" />
            </span>
            {SITE.name}
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            A plataforma liga clientes a profissionais independentes para
            serviços em casa, com preços claros e marcação online.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Serviços</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {CATALOG.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/servicos/${c.slug}`}
                  className="hover:text-foreground"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Localidades</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {locations.map((l) => (
              <li key={l.slug}>
                <Link
                  href={`/marido-de-aluguer/${l.slug}`}
                  className="hover:text-foreground"
                >
                  Marido de aluguer em {l.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Plataforma</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/como-funciona" className="hover:text-foreground">
                Como funciona
              </Link>
            </li>
            <li>
              <Link
                href="/para-profissionais"
                className="hover:text-foreground"
              >
                Para profissionais
              </Link>
            </li>
            <li>
              <Link href="/ajuda" className="hover:text-foreground">
                Ajuda
              </Link>
            </li>
            <li>
              <Link href="/contactos" className="hover:text-foreground">
                Contactos
              </Link>
            </li>
            <li>
              <Link href="/termos" className="hover:text-foreground">
                Termos
              </Link>
            </li>
            <li>
              <Link href="/privacidade" className="hover:text-foreground">
                Privacidade
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t py-6">
        <div className="mx-auto max-w-6xl px-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {SITE.name}. A plataforma liga clientes a
          profissionais independentes. Os preços podem variar consoante a
          complexidade, materiais e deslocação.
        </div>
      </div>
    </footer>
  );
}
