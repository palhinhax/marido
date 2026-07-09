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
