import { SITE, absoluteUrl } from "@/lib/site";

// --- JSON-LD builders --------------------------------------------------------
export interface Crumb {
  name: string;
  href: string;
}

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.href),
    })),
  };
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function serviceJsonLd(params: {
  name: string;
  description: string;
  url: string;
  price: number | null;
  areaServed?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: params.name,
    description: params.description,
    serviceType: params.name,
    provider: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
    },
    areaServed: params.areaServed
      ? { "@type": "AdministrativeArea", name: params.areaServed }
      : { "@type": "Country", name: "Portugal" },
    url: absoluteUrl(params.url),
    ...(params.price !== null && {
      offers: {
        "@type": "Offer",
        price: params.price,
        priceCurrency: "EUR",
        availability: "https://schema.org/InStock",
      },
    }),
  };
}

export function localBusinessJsonLd(params: {
  name: string;
  description: string;
  url: string;
  areaServed: string;
  rating?: { value: number; count: number };
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: params.name,
    description: params.description,
    url: absoluteUrl(params.url),
    areaServed: { "@type": "City", name: params.areaServed },
    address: {
      "@type": "PostalAddress",
      addressCountry: "PT",
      addressLocality: params.areaServed,
    },
    ...(params.rating &&
      params.rating.count > 0 && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: params.rating.value,
          reviewCount: params.rating.count,
        },
      }),
  };
}

// --- Brand entity (Organization + WebSite) -----------------------------------
// The brand is "Vizinho", but people search the generic term. Declaring these
// as alternateName helps Google associate the brand with "marido de aluguer".
const BRAND_ALTERNATE_NAMES = [
  "Marido de Aluguer",
  "Faz-tudo",
  "Serviços para casa",
];

export function organizationJsonLd(opts?: {
  sameAs?: string[];
  logo?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    alternateName: BRAND_ALTERNATE_NAMES,
    url: SITE.url,
    description: SITE.description,
    email: SITE.email,
    telephone: SITE.phone,
    areaServed: { "@type": "Country", name: "Portugal" },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: SITE.email,
      telephone: SITE.phone,
      areaServed: "PT",
      availableLanguage: ["Portuguese"],
    },
    ...(opts?.logo && { logo: absoluteUrl(opts.logo) }),
    ...(opts?.sameAs && opts.sameAs.length > 0 && { sameAs: opts.sameAs }),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    alternateName: BRAND_ALTERNATE_NAMES,
    url: SITE.url,
    inLanguage: "pt-PT",
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
  };
}
