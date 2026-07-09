// Portugal locations — districts and municipalities (concelhos).
// Used for programmatic SEO pages, the location selector and seeding.
// Slugs are ASCII, lowercase, hyphenated (no accents) for clean URLs.

export interface Municipality {
  name: string;
  slug: string;
}

export interface District {
  name: string;
  slug: string;
  region: string;
  municipalities: Municipality[];
}

export const DISTRICTS: District[] = [
  {
    name: "Lisboa",
    slug: "lisboa",
    region: "Área Metropolitana de Lisboa",
    municipalities: [
      { name: "Lisboa", slug: "lisboa" },
      { name: "Sintra", slug: "sintra" },
      { name: "Cascais", slug: "cascais" },
      { name: "Oeiras", slug: "oeiras" },
      { name: "Loures", slug: "loures" },
      { name: "Amadora", slug: "amadora" },
      { name: "Odivelas", slug: "odivelas" },
      { name: "Mafra", slug: "mafra" },
      { name: "Vila Franca de Xira", slug: "vila-franca-de-xira" },
    ],
  },
  {
    name: "Porto",
    slug: "porto",
    region: "Área Metropolitana do Porto",
    municipalities: [
      { name: "Porto", slug: "porto" },
      { name: "Vila Nova de Gaia", slug: "vila-nova-de-gaia" },
      { name: "Matosinhos", slug: "matosinhos" },
      { name: "Maia", slug: "maia" },
      { name: "Gondomar", slug: "gondomar" },
    ],
  },
  {
    name: "Setúbal",
    slug: "setubal",
    region: "Área Metropolitana de Lisboa",
    municipalities: [
      { name: "Setúbal", slug: "setubal" },
      { name: "Almada", slug: "almada" },
      { name: "Seixal", slug: "seixal" },
      { name: "Barreiro", slug: "barreiro" },
      { name: "Montijo", slug: "montijo" },
    ],
  },
  {
    name: "Braga",
    slug: "braga",
    region: "Norte",
    municipalities: [
      { name: "Braga", slug: "braga" },
      { name: "Guimarães", slug: "guimaraes" },
      { name: "Barcelos", slug: "barcelos" },
    ],
  },
  {
    name: "Aveiro",
    slug: "aveiro",
    region: "Centro",
    municipalities: [
      { name: "Aveiro", slug: "aveiro" },
      { name: "Águeda", slug: "agueda" },
      { name: "Ílhavo", slug: "ilhavo" },
    ],
  },
  {
    name: "Coimbra",
    slug: "coimbra",
    region: "Centro",
    municipalities: [
      { name: "Coimbra", slug: "coimbra" },
      { name: "Figueira da Foz", slug: "figueira-da-foz" },
    ],
  },
  {
    name: "Faro",
    slug: "faro",
    region: "Algarve",
    municipalities: [
      { name: "Faro", slug: "faro" },
      { name: "Loulé", slug: "loule" },
      { name: "Portimão", slug: "portimao" },
      { name: "Albufeira", slug: "albufeira" },
    ],
  },
  {
    name: "Leiria",
    slug: "leiria",
    region: "Centro",
    municipalities: [
      { name: "Leiria", slug: "leiria" },
      { name: "Caldas da Rainha", slug: "caldas-da-rainha" },
    ],
  },
  {
    name: "Santarém",
    slug: "santarem",
    region: "Centro",
    municipalities: [
      { name: "Santarém", slug: "santarem" },
      { name: "Tomar", slug: "tomar" },
    ],
  },
  {
    name: "Viseu",
    slug: "viseu",
    region: "Centro",
    municipalities: [
      { name: "Viseu", slug: "viseu" },
      { name: "Lamego", slug: "lamego" },
    ],
  },
];

export interface ResolvedLocation {
  name: string;
  slug: string;
  district: District;
  isDistrictCapital: boolean;
}

// Flat list of every municipality with its parent district.
export const ALL_MUNICIPALITIES: ResolvedLocation[] = DISTRICTS.flatMap(
  (district) =>
    district.municipalities.map((m) => ({
      name: m.name,
      slug: m.slug,
      district,
      isDistrictCapital: m.slug === district.slug,
    }))
);

// The most relevant municipalities for the homepage / "popular locations".
export const POPULAR_LOCATION_SLUGS = [
  "lisboa",
  "porto",
  "sintra",
  "cascais",
  "oeiras",
  "loures",
  "vila-nova-de-gaia",
  "braga",
  "coimbra",
  "almada",
];

export function getLocationBySlug(slug: string): ResolvedLocation | undefined {
  return ALL_MUNICIPALITIES.find((l) => l.slug === slug);
}

export function getDistrictBySlug(slug: string): District | undefined {
  return DISTRICTS.find((d) => d.slug === slug);
}

export function getPopularLocations(): ResolvedLocation[] {
  return POPULAR_LOCATION_SLUGS.map((s) => getLocationBySlug(s)).filter(
    (l): l is ResolvedLocation => Boolean(l)
  );
}

// Big cities with enough demand to justify dedicated service × city SEO pages
// (e.g. /servicos/canalizacao/trocar-torneira/lisboa). Kept curated to avoid
// thin, near-duplicate pages across every small municipality.
export const SEO_SERVICE_CITY_SLUGS = [
  "lisboa",
  "porto",
  "sintra",
  "cascais",
  "oeiras",
  "loures",
  "vila-nova-de-gaia",
  "braga",
  "coimbra",
  "almada",
  "setubal",
  "faro",
];

export function getServiceCityLocations(): ResolvedLocation[] {
  return SEO_SERVICE_CITY_SLUGS.map((s) => getLocationBySlug(s)).filter(
    (l): l is ResolvedLocation => Boolean(l)
  );
}
