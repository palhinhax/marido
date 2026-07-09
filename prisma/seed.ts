import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CATALOG } from "../lib/data/catalog";
import { DISTRICTS } from "../lib/data/locations";

const prisma = new PrismaClient();

function ref(): string {
  const s = "PJ-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  return s;
}

// Weekly availability preset: Mon–Fri 09:00–18:00, Sat 09:00–13:00.
function weekdayRules(): Prisma.AvailabilityRuleCreateWithoutProfessionalInput[] {
  const rules: Prisma.AvailabilityRuleCreateWithoutProfessionalInput[] = [];
  for (let day = 1; day <= 5; day++) {
    rules.push({
      dayOfWeek: day,
      startTime: "09:00",
      endTime: "18:00",
      slotDurationMinutes: 60,
    });
  }
  rules.push({
    dayOfWeek: 6,
    startTime: "09:00",
    endTime: "13:00",
    slotDurationMinutes: 60,
  });
  return rules;
}

async function main() {
  console.log("🌱 A semear a base de dados Vizinho...");

  // Clean slate (order matters for FKs)
  await prisma.$transaction([
    prisma.review.deleteMany(),
    prisma.bookingStatusHistory.deleteMany(),
    prisma.bookingPhoto.deleteMany(),
    prisma.booking.deleteMany(),
    prisma.availabilityException.deleteMany(),
    prisma.availabilityRule.deleteMany(),
    prisma.professionalServiceArea.deleteMany(),
    prisma.professionalService.deleteMany(),
    prisma.verificationDocument.deleteMany(),
    prisma.serviceFaq.deleteMany(),
    prisma.serviceExtra.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.professionalProfile.deleteMany(),
    prisma.clientProfile.deleteMany(),
    prisma.service.deleteMany(),
    prisma.serviceCategory.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // --- Catalog -------------------------------------------------------------
  const serviceIdBySlug = new Map<string, string>();

  for (const cat of CATALOG) {
    const category = await prisma.serviceCategory.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        seoTitle: cat.seoTitle,
        seoDescription: cat.seoDescription,
        order: cat.order,
      },
    });

    for (const [i, svc] of cat.services.entries()) {
      const created = await prisma.service.create({
        data: {
          categoryId: category.id,
          name: svc.name,
          slug: svc.slug,
          shortDescription: svc.shortDescription,
          description: svc.description,
          basePrice: svc.basePrice,
          priceType: svc.priceType,
          estimatedDurationMinutes: svc.estimatedDurationMinutes,
          included: svc.included,
          notIncluded: svc.notIncluded,
          requiresPhotos: svc.requiresPhotos,
          requiresQuote: svc.priceType === "QUOTE",
          professionalRole: cat.professionalRole,
          order: i,
          extras: {
            create: svc.extras.map((e) => ({ name: e.name, price: e.price })),
          },
          faqs: {
            create: svc.faqs.map((f, idx) => ({
              question: f.question,
              answer: f.answer,
              order: idx,
            })),
          },
        },
      });
      serviceIdBySlug.set(svc.slug, created.id);
    }
  }
  console.log(
    `✅ ${CATALOG.length} categorias e ${serviceIdBySlug.size} serviços criados`
  );

  // --- Users ---------------------------------------------------------------
  const hash = await bcrypt.hash("password123", 12);

  await prisma.user.create({
    data: {
      name: "Admin Vizinho",
      email: "admin@vizinho.pt",
      passwordHash: hash,
      role: "ADMIN",
      phone: "912000000",
    },
  });

  const client = await prisma.user.create({
    data: {
      name: "Cliente Demo",
      email: "cliente@vizinho.pt",
      passwordHash: hash,
      role: "CLIENT",
      phone: "913111222",
      clientProfile: { create: { phone: "913111222" } },
    },
  });

  console.log("✅ Admin e cliente criados");

  // --- Professionals -------------------------------------------------------
  const proSeeds = [
    {
      name: "João Silva",
      email: "joao@vizinho.pt",
      slug: "joao-silva",
      displayName: "João Silva — Reparações",
      headline: "Marido de aluguer com 12 anos de experiência",
      description:
        "Faço reparações e montagens em casa há mais de 12 anos. Trabalho limpo, pontual e com garantia. Lisboa e arredores.",
      years: 12,
      categories: ["reparacoes-e-manutencao", "montagens", "eletricidade"],
      district: "Lisboa",
      municipalities: ["Lisboa", "Oeiras", "Amadora", "Sintra"],
      rating: 4.9,
      ratingCount: 87,
      completed: 210,
      featured: true,
    },
    {
      name: "Miguel Costa",
      email: "miguel@vizinho.pt",
      slug: "miguel-costa",
      displayName: "Miguel Costa — Canalizador",
      headline: "Canalizador certificado, resposta rápida",
      description:
        "Canalizador com resposta no próprio dia para fugas e desentupimentos. Orçamento claro antes de começar.",
      years: 8,
      categories: ["canalizacao"],
      district: "Lisboa",
      municipalities: ["Lisboa", "Loures", "Odivelas"],
      rating: 4.8,
      ratingCount: 54,
      completed: 132,
      featured: true,
    },
    {
      name: "Ana Ferreira",
      email: "ana@vizinho.pt",
      slug: "ana-ferreira",
      displayName: "Ana Ferreira — Pintura",
      headline: "Pintura e acabamentos com atenção ao detalhe",
      description:
        "Especialista em pintura de interiores e pequenos arranjos de paredes. Trabalho cuidado e sem sujidade.",
      years: 6,
      categories: ["pintura-e-paredes", "reparacoes-e-manutencao"],
      district: "Porto",
      municipalities: ["Porto", "Vila Nova de Gaia", "Matosinhos"],
      rating: 5.0,
      ratingCount: 41,
      completed: 96,
      featured: false,
    },
    {
      name: "Rui Marques",
      email: "rui@vizinho.pt",
      slug: "rui-marques",
      displayName: "Rui Marques — Eletricista & Casa Inteligente",
      headline: "Eletricista e instalação de casa inteligente",
      description:
        "Instalo iluminação, câmaras Wi-Fi e sistemas de casa inteligente. Explico tudo de forma simples.",
      years: 9,
      categories: ["eletricidade", "casa-inteligente"],
      district: "Lisboa",
      municipalities: ["Lisboa", "Cascais", "Oeiras"],
      rating: 4.7,
      ratingCount: 33,
      completed: 78,
      featured: false,
    },
  ];

  const proProfiles: {
    id: string;
    slug: string;
    district: string;
    municipalities: string[];
    categories: string[];
  }[] = [];

  for (const p of proSeeds) {
    const user = await prisma.user.create({
      data: {
        name: p.name,
        email: p.email,
        passwordHash: hash,
        role: "PROFESSIONAL",
        phone: "914" + Math.floor(100000 + Math.random() * 899999),
      },
    });

    const serviceSlugs = CATALOG.filter((c) =>
      p.categories.includes(c.slug)
    ).flatMap((c) => c.services.map((s) => s.slug));

    const profile = await prisma.professionalProfile.create({
      data: {
        userId: user.id,
        slug: p.slug,
        displayName: p.displayName,
        headline: p.headline,
        description: p.description,
        phone: user.phone,
        whatsapp: user.phone,
        yearsExperience: p.years,
        isVerified: true,
        isFeatured: p.featured,
        approvalStatus: "APPROVED",
        ratingAverage: p.rating,
        ratingCount: p.ratingCount,
        completedJobs: p.completed,
        onboardingStep: 7,
        services: {
          create: serviceSlugs.map((slug) => ({
            serviceId: serviceIdBySlug.get(slug)!,
          })),
        },
        serviceAreas: {
          create: p.municipalities.map((m) => {
            const district = DISTRICTS.find((d) => d.name === p.district)!;
            const muni = district.municipalities.find((mm) => mm.name === m);
            return {
              district: p.district,
              municipality: m,
              municipalitySlug: muni?.slug,
            };
          }),
        },
        availability: { create: weekdayRules() },
      },
    });

    proProfiles.push({
      id: profile.id,
      slug: p.slug,
      district: p.district,
      municipalities: p.municipalities,
      categories: p.categories,
    });
  }
  console.log(
    `✅ ${proProfiles.length} profissionais criados (1 pendente de aprovação abaixo)`
  );

  // A professional pending approval (for the admin queue)
  const pendingUser = await prisma.user.create({
    data: {
      name: "Carla Nunes",
      email: "carla@vizinho.pt",
      passwordHash: hash,
      role: "PROFESSIONAL",
      phone: "915222333",
    },
  });
  await prisma.professionalProfile.create({
    data: {
      userId: pendingUser.id,
      slug: "carla-nunes",
      displayName: "Carla Nunes — Jardim",
      headline: "Serviços de jardim e exterior",
      description:
        "Corte de relva, sebes e limpeza de quintais no distrito de Setúbal.",
      yearsExperience: 4,
      approvalStatus: "PENDING",
      onboardingStep: 7,
      services: {
        create: CATALOG.find(
          (c) => c.slug === "jardim-e-exterior"
        )!.services.map((s) => ({
          serviceId: serviceIdBySlug.get(s.slug)!,
        })),
      },
      serviceAreas: {
        create: [
          {
            district: "Setúbal",
            municipality: "Almada",
            municipalitySlug: "almada",
          },
        ],
      },
      availability: { create: weekdayRules() },
    },
  });

  // --- Sample bookings -----------------------------------------------------
  const now = new Date();
  const day = 24 * 60 * 60 * 1000;

  const bookingsData = [
    {
      serviceSlug: "montagem-de-moveis",
      pro: proProfiles[0],
      status: "PENDING" as const,
      start: new Date(now.getTime() + 2 * day),
      municipality: "Lisboa",
      desc: "Preciso de montar um roupeiro PAX e duas mesas de cabeceira do IKEA.",
    },
    {
      serviceSlug: "trocar-torneira",
      pro: proProfiles[1],
      status: "ACCEPTED" as const,
      start: new Date(now.getTime() + 1 * day),
      municipality: "Lisboa",
      desc: "Torneira da cozinha a pingar, quero substituir por uma nova que já comprei.",
    },
    {
      serviceSlug: "instalar-candeeiro",
      pro: proProfiles[3],
      status: "COMPLETED" as const,
      start: new Date(now.getTime() - 5 * day),
      municipality: "Cascais",
      desc: "Instalar dois candeeiros de teto na sala.",
      review: {
        rating: 5,
        comment: "Excelente trabalho, muito profissional e pontual!",
      },
    },
  ];

  for (const b of bookingsData) {
    const svc = CATALOG.flatMap((c) => c.services).find(
      (s) => s.slug === b.serviceSlug
    )!;
    const district = DISTRICTS.find((d) =>
      d.municipalities.some((m) => m.name === b.municipality)
    )!;
    const start = b.start;
    const end = new Date(
      start.getTime() + svc.estimatedDurationMinutes * 60 * 1000
    );

    const booking = await prisma.booking.create({
      data: {
        reference: ref(),
        clientId: client.id,
        professionalId: b.pro.id,
        serviceId: serviceIdBySlug.get(b.serviceSlug)!,
        status: b.status,
        address: "Rua Exemplo, 12",
        postalCode: "1000-001",
        city: b.municipality,
        municipality: b.municipality,
        district: district.name,
        clientDescription: b.desc,
        urgency: "NORMAL",
        propertyType: "APARTMENT",
        scheduledStart: start,
        scheduledEnd: end,
        estimatedPrice: svc.basePrice,
        priceType: svc.priceType,
        clientName: "Cliente Demo",
        clientEmail: "cliente@vizinho.pt",
        clientPhone: "913111222",
        statusHistory: { create: { status: b.status } },
      },
    });

    if ("review" in b && b.review) {
      await prisma.review.create({
        data: {
          bookingId: booking.id,
          clientId: client.id,
          professionalId: b.pro.id,
          rating: b.review.rating,
          comment: b.review.comment,
        },
      });
    }
  }
  console.log(`✅ ${bookingsData.length} pedidos de exemplo criados`);

  console.log("\n📧 Credenciais de acesso (password: password123):");
  console.log("   Admin:        admin@vizinho.pt");
  console.log("   Cliente:      cliente@vizinho.pt");
  console.log("   Profissional: joao@vizinho.pt");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
