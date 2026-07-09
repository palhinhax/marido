// Central site configuration (brand, URLs, contacts).
export const SITE = {
  name: "Vizinho",
  tagline: "Serviços para casa em Portugal, marcados online",
  description:
    "Encontre profissionais para reparações, montagens, canalização, eletricidade, pintura, jardim e pequenos arranjos domésticos. Marcação online rápida com preços claros.",
  // Used as metadataBase for canonical/OG URLs. Override with NEXT_PUBLIC_SITE_URL.
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://vizinho.pt",
  locale: "pt-PT",
  country: "PT",
  email: "ola@vizinho.pt",
  phone: "+351 210 000 000",
  // WhatsApp number in international format without "+" (e.g. "351912345678").
  // Empty string hides all WhatsApp CTAs.
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
} as const;

export function whatsappUrl(message: string): string {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function absoluteUrl(path: string): string {
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}
