import Link from "next/link";
import { MapPin } from "lucide-react";
import { getPopularLocations } from "@/lib/data/locations";

// Links to SEO landing pages for a given role (defaults to marido-de-aluguer).
export function PopularLocations({
  roleSlug = "marido-de-aluguer",
  title = "Localidades populares",
}: {
  roleSlug?: string;
  title?: string;
}) {
  const locations = getPopularLocations();
  return (
    <section>
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {locations.map((l) => (
          <Link
            key={l.slug}
            href={`/${roleSlug}/${l.slug}`}
            className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2.5 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
          >
            <MapPin className="h-4 w-4 text-muted-foreground" />
            {l.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
