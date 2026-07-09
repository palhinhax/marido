// Service catalog for Portugal — categories and services.
// Single source of truth for SEO pages and database seeding.
// Prices are in whole euros. `priceType` QUOTE means "orçamento sob avaliação".

export type PriceTypeSlug = "FIXED" | "STARTING" | "HOURLY" | "QUOTE";

export interface CatalogFaq {
  question: string;
  answer: string;
}

export interface CatalogService {
  name: string;
  slug: string;
  basePrice: number | null;
  priceType: PriceTypeSlug;
  estimatedDurationMinutes: number;
  shortDescription: string;
  description: string;
  included: string[];
  notIncluded: string[];
  requiresPhotos: boolean;
  extras: { name: string; price: number }[];
  faqs: CatalogFaq[];
}

export interface CatalogCategory {
  name: string;
  slug: string;
  icon: string; // lucide icon name
  description: string;
  seoTitle: string;
  seoDescription: string;
  order: number;
  // "professional role" used in SEO landing slugs like /canalizador/lisboa
  professionalRole: string;
  services: CatalogService[];
}

// --- Shared defaults, kept DRY -------------------------------------------------

const DEFAULT_INCLUDED = [
  "Deslocação dentro da área de serviço",
  "Mão de obra do profissional",
  "Pequeno material de fixação quando aplicável",
];

const DEFAULT_NOT_INCLUDED = [
  "Materiais e peças específicas (ex.: torneiras, candeeiros)",
  "Trabalhos de obra ou remodelação",
  "IVA quando aplicável ao profissional",
];

function priceLabel(price: number | null, type: PriceTypeSlug): string {
  if (type === "QUOTE" || price === null) return "Orçamento sob avaliação";
  if (type === "FIXED") return `${price}€`;
  if (type === "HOURLY") return `${price}€/hora`;
  return `A partir de ${price}€`;
}

// Build a service with sensible defaults + per-service overrides.
function service(input: {
  name: string;
  slug: string;
  price: number | null;
  type?: PriceTypeSlug;
  duration?: number;
  short: string;
  desc: string;
  included?: string[];
  notIncluded?: string[];
  requiresPhotos?: boolean;
  extras?: { name: string; price: number }[];
  faqs?: CatalogFaq[];
}): CatalogService {
  const type = input.type ?? (input.price === null ? "QUOTE" : "STARTING");
  const duration = input.duration ?? 60;
  const baseFaqs: CatalogFaq[] = [
    {
      question: `Quanto custa ${input.name.toLowerCase()}?`,
      answer:
        type === "QUOTE"
          ? "Este serviço é orçamentado após avaliação, porque o preço depende da dimensão e complexidade do trabalho. Peça a marcação e receberá um orçamento sem compromisso."
          : `O preço começa em ${priceLabel(input.price, type)}. O valor final pode variar consoante a complexidade, os materiais e o tempo necessário.`,
    },
    {
      question: "Os materiais estão incluídos no preço?",
      answer:
        "O preço indicado refere-se à mão de obra e pequeno material de fixação. Materiais específicos (peças, torneiras, candeeiros, tinta) são pagos à parte ou fornecidos por si.",
    },
    {
      question: "Quanto tempo demora o serviço?",
      answer: `A duração estimada é de cerca de ${Math.round(duration / 60 === Math.floor(duration / 60) ? duration / 60 : duration / 60)} h. Pode variar consoante as condições no local.`,
    },
  ];
  return {
    name: input.name,
    slug: input.slug,
    basePrice: input.price,
    priceType: type,
    estimatedDurationMinutes: duration,
    shortDescription: input.short,
    description: input.desc,
    included: input.included ?? DEFAULT_INCLUDED,
    notIncluded: input.notIncluded ?? DEFAULT_NOT_INCLUDED,
    requiresPhotos: input.requiresPhotos ?? false,
    extras: input.extras ?? [],
    faqs: input.faqs ?? baseFaqs,
  };
}

// --- Catalog -------------------------------------------------------------------

export const CATALOG: CatalogCategory[] = [
  {
    name: "Reparações e Manutenção",
    slug: "reparacoes-e-manutencao",
    icon: "Wrench",
    description:
      "Pequenos arranjos domésticos, reparação de portas e estores, troca de fechaduras e tudo o que precisa de um marido de aluguer de confiança.",
    seoTitle: "Reparações e Manutenção em Casa | Preços Definidos",
    seoDescription:
      "Peça serviços de reparação e manutenção em casa: portas, estores, fechaduras e pequenos arranjos. Marcação online com preços claros.",
    order: 1,
    professionalRole: "marido-de-aluguer",
    services: [
      service({
        name: "Pendurar quadros e prateleiras",
        slug: "pendurar-quadros-e-prateleiras",
        price: 25,
        duration: 60,
        short:
          "Fixação segura de quadros, prateleiras e espelhos em qualquer parede.",
        desc: "Penduramos quadros, prateleiras, espelhos e cabides com a fixação certa para o tipo de parede (pladur, tijolo ou betão), com nível e acabamento cuidado. Ideal para várias peças de uma só vez.",
        requiresPhotos: true,
        extras: [
          { name: "Peça adicional", price: 5 },
          { name: "Parede de betão", price: 10 },
        ],
      }),
      service({
        name: "Reparação de portas",
        slug: "reparacao-de-portas",
        price: 30,
        duration: 90,
        short:
          "Ajuste de portas que não fecham, dobradiças soltas e puxadores.",
        desc: "Resolvemos portas que arrastam, não fecham ou têm dobradiças e fechaduras com folga. Afinação de dobradiças, substituição de puxadores e ajustes de alinhamento.",
      }),
      service({
        name: "Reparação de estores",
        slug: "reparacao-de-estores",
        price: 35,
        duration: 90,
        short: "Estores encravados, fita partida ou lâminas danificadas.",
        desc: "Reparação de estores manuais e elétricos: substituição de fita, desencravamento, troca de lâminas e afinação. Avaliamos a solução mais económica antes de avançar.",
        requiresPhotos: true,
      }),
      service({
        name: "Troca de fechaduras",
        slug: "troca-de-fechaduras",
        price: 40,
        duration: 60,
        short: "Substituição de fechaduras e canhões para mais segurança.",
        desc: "Substituição de fechaduras e canhões de segurança em portas de casa, quarto ou escritório. Aconselhamento sobre o nível de segurança adequado à sua porta.",
      }),
      service({
        name: "Pequenos arranjos domésticos",
        slug: "pequenos-arranjos-domesticos",
        price: 30,
        type: "HOURLY",
        duration: 60,
        short: "Aquela lista de pequenas tarefas resolvida numa só visita.",
        desc: "O serviço de marido de aluguer por excelência: junte várias pequenas tarefas (apertar, fixar, vedar, ajustar) e resolvemos tudo numa visita, pago à hora.",
        requiresPhotos: true,
      }),
    ],
  },
  {
    name: "Canalização",
    slug: "canalizacao",
    icon: "Droplets",
    description:
      "Torneiras, fugas de água, desentupimentos e instalação de eletrodomésticos com canalizadores avaliados.",
    seoTitle: "Canalizador ao Domicílio | Torneiras, Fugas e Desentupimentos",
    seoDescription:
      "Precisa de um canalizador? Troca de torneiras, reparação de fugas, desentupimentos e instalação de máquinas. Marcação online rápida em Portugal.",
    order: 2,
    professionalRole: "canalizador",
    services: [
      service({
        name: "Trocar torneira",
        slug: "trocar-torneira",
        price: 35,
        duration: 60,
        short: "Substituição de torneiras de cozinha ou casa de banho.",
        desc: "Substituímos torneiras de lavatório, bidé, cozinha ou banheira, com verificação de vedantes e teste de fugas. Traga a torneira nova ou peça aconselhamento.",
        requiresPhotos: true,
      }),
      service({
        name: "Desentupir lavatório",
        slug: "desentupir-lavatorio",
        price: 40,
        duration: 60,
        short: "Lavatório ou pia com escoamento lento ou entupido.",
        desc: "Desentupimento de lavatórios e pias, limpeza de sifão e verificação do escoamento. Método adequado para não danificar a canalização.",
      }),
      service({
        name: "Desentupir sanita",
        slug: "desentupir-sanita",
        price: 45,
        duration: 60,
        short: "Sanita entupida resolvida de forma rápida e limpa.",
        desc: "Desentupimento de sanitas com equipamento próprio, sem danificar a loiça, e verificação do funcionamento do autoclismo.",
      }),
      service({
        name: "Reparar fuga de água",
        slug: "reparar-fuga-de-agua",
        price: 45,
        duration: 90,
        short: "Deteção e reparação de fugas em canos e ligações.",
        desc: "Identificamos e reparamos fugas em ligações, sifões e tubagens acessíveis. Fugas dentro de parede podem exigir orçamento após avaliação.",
        requiresPhotos: true,
      }),
      service({
        name: "Instalar máquina de lavar",
        slug: "instalar-maquina-de-lavar",
        price: 40,
        duration: 60,
        short: "Ligação de máquina de lavar roupa ou loiça.",
        desc: "Instalação e ligação de máquina de lavar roupa ou loiça à água e esgoto, com teste de funcionamento e verificação de fugas.",
      }),
      service({
        name: "Substituir autoclismo",
        slug: "substituir-autoclismo",
        price: 50,
        duration: 90,
        short: "Autoclismo que corre água ou não enche corretamente.",
        desc: "Substituição de mecanismos de autoclismo (torneira de boia, válvula de descarga) ou do autoclismo completo, com afinação e teste.",
      }),
    ],
  },
  {
    name: "Eletricidade",
    slug: "eletricidade",
    icon: "Zap",
    description:
      "Tomadas, interruptores, candeeiros e iluminação LED instalados por profissionais com segurança.",
    seoTitle: "Eletricista ao Domicílio | Tomadas, Candeeiros e Iluminação",
    seoDescription:
      "Eletricista para pequenos trabalhos: tomadas, interruptores, candeeiros, iluminação LED e campainhas. Marcação online com preço à partida.",
    order: 3,
    professionalRole: "eletricista",
    services: [
      service({
        name: "Trocar tomada ou interruptor",
        slug: "trocar-tomada-ou-interruptor",
        price: 25,
        duration: 45,
        short: "Substituição de tomadas e interruptores danificados.",
        desc: "Substituição segura de tomadas e interruptores, com verificação da ligação e teste. Preço por ponto, com desconto para vários pontos.",
        extras: [{ name: "Ponto adicional", price: 8 }],
      }),
      service({
        name: "Instalar candeeiro",
        slug: "instalar-candeeiro",
        price: 30,
        duration: 60,
        short: "Montagem e ligação de candeeiros de teto ou parede.",
        desc: "Instalação de candeeiros, plafons e lustres, com fixação adequada ao teto e ligação elétrica testada.",
        requiresPhotos: true,
      }),
      service({
        name: "Instalar iluminação LED",
        slug: "instalar-iluminacao-led",
        price: 35,
        duration: 90,
        short: "Fitas e focos LED para uma casa mais eficiente.",
        desc: "Instalação de iluminação LED (focos embutidos, fitas, painéis) com aconselhamento sobre temperatura de cor e eficiência.",
      }),
      service({
        name: "Resolver falha elétrica simples",
        slug: "resolver-falha-eletrica-simples",
        price: 40,
        duration: 60,
        short: "Disjuntor que dispara ou circuito sem energia.",
        desc: "Diagnóstico de falhas simples: disjuntor que dispara, tomada sem energia ou circuito interrompido. Situações complexas podem exigir orçamento.",
      }),
      service({
        name: "Instalar campainha",
        slug: "instalar-campainha",
        price: 30,
        duration: 60,
        short: "Campainha com fios ou sem fios instalada e testada.",
        desc: "Instalação ou substituição de campainhas com e sem fios, incluindo botão exterior e módulo interior.",
      }),
      service({
        name: "Substituir disjuntor simples",
        slug: "substituir-disjuntor-simples",
        price: 35,
        duration: 60,
        short: "Troca de disjuntor no quadro elétrico.",
        desc: "Substituição de um disjuntor no quadro elétrico, com identificação do circuito e teste de funcionamento.",
        requiresPhotos: true,
      }),
    ],
  },
  {
    name: "Montagens",
    slug: "montagens",
    icon: "Hammer",
    description:
      "Montagem de móveis IKEA e de qualquer marca: camas, roupeiros, estantes e secretárias.",
    seoTitle: "Montagem de Móveis ao Domicílio | IKEA e Outras Marcas",
    seoDescription:
      "Montagem de móveis IKEA e de qualquer marca: camas, roupeiros, cómodas, estantes e secretárias. A partir de 25€. Marcação online.",
    order: 4,
    professionalRole: "montador-de-moveis",
    services: [
      service({
        name: "Montagem de móveis",
        slug: "montagem-de-moveis",
        price: 25,
        duration: 60,
        short: "Montagem de móveis de qualquer marca, com cuidado e rapidez.",
        desc: "Montamos móveis de qualquer marca a partir das instruções, com as ferramentas certas e acabamento nivelado. Indique o número e tipo de peças para uma estimativa mais precisa.",
        requiresPhotos: true,
      }),
      service({
        name: "Montagem de cama",
        slug: "montagem-de-cama",
        price: 30,
        duration: 60,
        short: "Camas e estrados montados e prontos a usar.",
        desc: "Montagem de camas, estrados e cabeceiras, incluindo fixação à parede quando necessário.",
      }),
      service({
        name: "Montagem de roupeiro",
        slug: "montagem-de-roupeiro",
        price: 45,
        duration: 120,
        short: "Roupeiros e armários montados e alinhados.",
        desc: "Montagem de roupeiros e armários, incluindo portas de correr, gavetas e fixação de segurança à parede.",
        requiresPhotos: true,
      }),
      service({
        name: "Montagem de cómoda",
        slug: "montagem-de-comoda",
        price: 30,
        duration: 60,
        short: "Cómodas e gavetões montados corretamente.",
        desc: "Montagem de cómodas e gavetões, com afinação de gavetas e fixação anti-queda à parede.",
      }),
      service({
        name: "Montagem de secretária",
        slug: "montagem-de-secretaria",
        price: 25,
        duration: 60,
        short: "Secretárias prontas para o seu escritório ou estudo.",
        desc: "Montagem de secretárias e mesas de trabalho, com verificação de estabilidade e nível.",
      }),
      service({
        name: "Montagem de estante",
        slug: "montagem-de-estante",
        price: 30,
        duration: 60,
        short: "Estantes montadas e fixas com segurança.",
        desc: "Montagem de estantes e prateleiras modulares, com fixação à parede para evitar tombos.",
      }),
      service({
        name: "Montagem de móveis IKEA",
        slug: "montagem-de-moveis-ikea",
        price: 25,
        duration: 60,
        short: "Especialistas em montagem de móveis IKEA.",
        desc: "Montagem de móveis IKEA de todas as gamas (PAX, MALM, BILLY, KALLAX e outros), com rapidez e sem stress. Indique as referências para uma estimativa.",
        requiresPhotos: true,
      }),
    ],
  },
  {
    name: "Pintura e Paredes",
    slug: "pintura-e-paredes",
    icon: "PaintRoller",
    description:
      "Pintura de divisões e tetos, reparação de fissuras e retoques com acabamento profissional.",
    seoTitle: "Pintor ao Domicílio | Pintar Divisões, Tetos e Retoques",
    seoDescription:
      "Serviços de pintura para casa: pintar divisões e tetos, tapar furos e reparar fissuras. Orçamento claro após avaliação. Marcação online.",
    order: 5,
    professionalRole: "pintor",
    services: [
      service({
        name: "Pintar uma divisão",
        slug: "pintar-uma-divisao",
        price: null,
        type: "QUOTE",
        duration: 240,
        short: "Pintura completa de um quarto, sala ou corredor.",
        desc: "Pintura de uma divisão com preparação de superfície, proteção de mobiliário e acabamento uniforme. O preço depende da área, do estado das paredes e do número de demãos.",
        requiresPhotos: true,
      }),
      service({
        name: "Tapar furos",
        slug: "tapar-furos",
        price: 25,
        duration: 60,
        short: "Furos e buracos tapados e prontos a pintar.",
        desc: "Reparação de furos de buchas e pequenos buracos, com barramento e lixagem, prontos para pintura.",
      }),
      service({
        name: "Reparar pequenas fissuras",
        slug: "reparar-pequenas-fissuras",
        price: 30,
        duration: 90,
        short: "Fissuras superficiais reparadas antes de pintar.",
        desc: "Abertura, reforço e barramento de pequenas fissuras superficiais em paredes e tetos.",
        requiresPhotos: true,
      }),
      service({
        name: "Pintar teto",
        slug: "pintar-teto",
        price: null,
        type: "QUOTE",
        duration: 180,
        short: "Pintura de teto com proteção e acabamento uniforme.",
        desc: "Pintura de teto com preparação, proteção do espaço e acabamento uniforme. Orçamento após avaliação da área e do estado.",
        requiresPhotos: true,
      }),
      service({
        name: "Retoques de pintura",
        slug: "retoques-de-pintura",
        price: 25,
        duration: 60,
        short: "Pequenos retoques para deixar as paredes como novas.",
        desc: "Retoques de pintura em zonas danificadas, marcas e riscos, com correspondência de cor sempre que possível.",
      }),
    ],
  },
  {
    name: "Casa Inteligente",
    slug: "casa-inteligente",
    icon: "Cctv",
    description:
      "Câmaras Wi-Fi, videoporteiros, lâmpadas e assistentes de voz instalados e configurados.",
    seoTitle: "Instalação de Casa Inteligente | Câmaras, Lâmpadas e Alexa",
    seoDescription:
      "Instalação e configuração de casa inteligente: câmaras Wi-Fi, videoporteiros, lâmpadas e tomadas inteligentes, Alexa e Google Home.",
    order: 6,
    professionalRole: "tecnico-casa-inteligente",
    services: [
      service({
        name: "Instalar câmara Wi-Fi",
        slug: "instalar-camara-wifi",
        price: 40,
        duration: 60,
        short: "Câmara de vigilância Wi-Fi instalada e configurada.",
        desc: "Instalação e configuração de câmaras Wi-Fi, incluindo ligação à app e ao seu telemóvel. Aconselhamento sobre o melhor posicionamento.",
        requiresPhotos: true,
      }),
      service({
        name: "Instalar videoporteiro",
        slug: "instalar-videoporteiro",
        price: 60,
        duration: 120,
        short: "Videoporteiro instalado para ver quem toca à porta.",
        desc: "Instalação de videoporteiro com fios ou Wi-Fi, ligação ao interior e configuração da aplicação.",
        requiresPhotos: true,
      }),
      service({
        name: "Configurar lâmpadas inteligentes",
        slug: "configurar-lampadas-inteligentes",
        price: 30,
        duration: 45,
        short: "Lâmpadas inteligentes ligadas e prontas a controlar.",
        desc: "Configuração de lâmpadas inteligentes na app e por voz, com criação de cenários e grupos.",
      }),
      service({
        name: "Configurar tomadas inteligentes",
        slug: "configurar-tomadas-inteligentes",
        price: 30,
        duration: 45,
        short: "Tomadas inteligentes configuradas e automatizadas.",
        desc: "Configuração de tomadas inteligentes, agendamentos e controlo por voz ou app.",
      }),
      service({
        name: "Configurar Alexa/Google Home",
        slug: "configurar-alexa-google-home",
        price: 30,
        duration: 60,
        short: "Assistente de voz configurado e ligado à sua casa.",
        desc: "Configuração de Alexa ou Google Home, ligação aos seus dispositivos e criação de rotinas.",
      }),
    ],
  },
  {
    name: "Jardim e Exterior",
    slug: "jardim-e-exterior",
    icon: "Trees",
    description:
      "Corte de relva, sebes, limpeza de quintais e caleiras para um exterior sempre cuidado.",
    seoTitle: "Jardineiro e Serviços de Exterior | Relva, Sebes e Limpeza",
    seoDescription:
      "Serviços de jardim e exterior: cortar relva, aparar sebes, limpar quintal e caleiras, montar barbecue. Marcação online em Portugal.",
    order: 7,
    professionalRole: "jardineiro",
    services: [
      service({
        name: "Cortar relva",
        slug: "cortar-relva",
        price: 30,
        duration: 60,
        short: "Relva cortada e jardim com aspeto cuidado.",
        desc: "Corte de relva, recolha de resíduos e acabamento de bordaduras. Preço consoante a área do jardim.",
        requiresPhotos: true,
      }),
      service({
        name: "Aparar sebes",
        slug: "aparar-sebes",
        price: 35,
        duration: 90,
        short: "Sebes e arbustos aparados e alinhados.",
        desc: "Corte e modelação de sebes e arbustos, com recolha dos resíduos.",
        requiresPhotos: true,
      }),
      service({
        name: "Limpar quintal",
        slug: "limpar-quintal",
        price: null,
        type: "QUOTE",
        duration: 180,
        short: "Limpeza e desmatação de quintais e terrenos.",
        desc: "Limpeza de quintais, remoção de ervas e resíduos. Orçamento após avaliação da área e do volume.",
        requiresPhotos: true,
      }),
      service({
        name: "Montar barbecue",
        slug: "montar-barbecue",
        price: 45,
        duration: 120,
        short: "Barbecue montado e pronto para o próximo convívio.",
        desc: "Montagem de barbecues e grelhadores a partir do kit, com verificação de estabilidade.",
      }),
      service({
        name: "Limpar caleiras",
        slug: "limpar-caleiras",
        price: 40,
        duration: 90,
        short: "Caleiras limpas para evitar entupimentos e infiltrações.",
        desc: "Limpeza de caleiras e algerozes, remoção de folhas e detritos e verificação do escoamento.",
        requiresPhotos: true,
      }),
    ],
  },
];

// --- Lookups & helpers ---------------------------------------------------------

export interface FlatService extends CatalogService {
  category: CatalogCategory;
}

export const ALL_SERVICES: FlatService[] = CATALOG.flatMap((c) =>
  c.services.map((s) => ({ ...s, category: c }))
);

export function getCategoryBySlug(slug: string): CatalogCategory | undefined {
  return CATALOG.find((c) => c.slug === slug);
}

export function getServiceBySlug(slug: string): FlatService | undefined {
  return ALL_SERVICES.find((s) => s.slug === slug);
}

export function getServiceByRole(role: string): FlatService[] {
  return ALL_SERVICES.filter((s) => s.category.professionalRole === role);
}

// SEO landing "roles" — e.g. /marido-de-aluguer/lisboa, /canalizador/porto.
export interface SeoRole {
  slug: string;
  label: string; // "Canalizador"
  h1: string; // "Canalizador em {location}"
  intro: string;
  categorySlug: string | null; // null = cross-category (marido de aluguer)
}

export const SEO_ROLES: SeoRole[] = [
  {
    slug: "marido-de-aluguer",
    label: "Marido de Aluguer",
    h1: "Marido de Aluguer",
    intro:
      "Reparações, montagens e pequenos arranjos domésticos com preço definido e marcação online.",
    categorySlug: null,
  },
  {
    slug: "canalizador",
    label: "Canalizador",
    h1: "Canalizador",
    intro:
      "Torneiras, fugas de água, desentupimentos e instalação de eletrodomésticos.",
    categorySlug: "canalizacao",
  },
  {
    slug: "eletricista",
    label: "Eletricista",
    h1: "Eletricista",
    intro: "Tomadas, interruptores, candeeiros e iluminação com segurança.",
    categorySlug: "eletricidade",
  },
  {
    slug: "montagem-de-moveis",
    label: "Montagem de Móveis",
    h1: "Montagem de Móveis",
    intro: "Montagem de móveis IKEA e de qualquer marca, a partir de 25€.",
    categorySlug: "montagens",
  },
  {
    slug: "pintor",
    label: "Pintor",
    h1: "Pintor",
    intro: "Pintura de divisões e tetos, retoques e reparação de fissuras.",
    categorySlug: "pintura-e-paredes",
  },
  {
    slug: "jardineiro",
    label: "Jardineiro",
    h1: "Jardineiro",
    intro:
      "Corte de relva, sebes aparadas, limpeza de quintais e caleiras para um exterior sempre cuidado.",
    categorySlug: "jardim-e-exterior",
  },
  {
    slug: "faz-tudo",
    label: "Faz-Tudo",
    h1: "Faz-Tudo",
    intro:
      "Um profissional para pequenas reparações, montagens e arranjos domésticos, com preço definido e marcação online.",
    categorySlug: null,
  },
  {
    slug: "servicos-domesticos",
    label: "Serviços Domésticos",
    h1: "Serviços Domésticos",
    intro:
      "Todos os pequenos serviços para a sua casa num só lugar, com profissionais avaliados.",
    categorySlug: null,
  },
];

export function getSeoRole(slug: string): SeoRole | undefined {
  return SEO_ROLES.find((r) => r.slug === slug);
}

export function formatPrice(price: number | null, type: PriceTypeSlug): string {
  return priceLabel(price, type);
}
