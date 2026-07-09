import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { CATALOG, ALL_SERVICES, SEO_ROLES } from "@/lib/data/catalog";
import { ALL_MUNICIPALITIES } from "@/lib/data/locations";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;
  const staticPages = [
    "",
    "/servicos",
    "/como-funciona",
    "/para-profissionais",
    "/ajuda",
    "/contactos",
    "/termos",
    "/privacidade",
    "/registar",
    "/registar/profissional",
    "/login",
  ].map((p) => ({
    url: `${base}${p}`,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));

  const categoryPages = CATALOG.map((c) => ({
    url: `${base}/servicos/${c.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const servicePages = ALL_SERVICES.map((s) => ({
    url: `${base}/servicos/${s.category.slug}/${s.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const landingPages = SEO_ROLES.flatMap((role) =>
    ALL_MUNICIPALITIES.map((loc) => ({
      url: `${base}/${role.slug}/${loc.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }))
  );

  return [...staticPages, ...categoryPages, ...servicePages, ...landingPages];
}
