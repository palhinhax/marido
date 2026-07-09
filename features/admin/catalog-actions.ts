"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("Sem permissões");
  return user;
}

// Refresh admin + the public catalog surfaces a service change can affect.
function revalidateCatalog(categorySlug?: string, serviceSlug?: string) {
  revalidatePath("/admin/servicos");
  revalidatePath("/servicos");
  if (categorySlug) revalidatePath(`/servicos/${categorySlug}`);
  if (categorySlug && serviceSlug) {
    revalidatePath(`/servicos/${categorySlug}/${serviceSlug}`);
  }
}

const serviceSchema = z.object({
  categoryId: z.string().min(1, "Escolha uma categoria"),
  name: z.string().min(2, "Nome demasiado curto"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug inválido (minúsculas, números e hífenes)"),
  shortDescription: z.string().min(1, "Descrição curta obrigatória"),
  description: z.string().min(1, "Descrição obrigatória"),
  priceType: z.enum(["FIXED", "STARTING", "HOURLY", "QUOTE"]),
  basePrice: z.coerce.number().int().min(0).nullable(),
  estimatedDurationMinutes: z.coerce.number().int().min(5).max(1440),
  requiresPhotos: z.boolean(),
  requiresQuote: z.boolean(),
  professionalRole: z.string().optional().or(z.literal("")),
  seoTitle: z.string().optional().or(z.literal("")),
  seoDescription: z.string().optional().or(z.literal("")),
  isActive: z.boolean(),
  order: z.coerce.number().int().min(0),
  included: z.array(z.string().min(1)),
  notIncluded: z.array(z.string().min(1)),
  extras: z.array(
    z.object({ name: z.string().min(1), price: z.coerce.number().int().min(0) })
  ),
  faqs: z.array(
    z.object({ question: z.string().min(1), answer: z.string().min(1) })
  ),
});

export type ServiceInput = z.infer<typeof serviceSchema>;

function scalarData(data: ServiceInput) {
  return {
    categoryId: data.categoryId,
    name: data.name,
    slug: slugify(data.slug),
    shortDescription: data.shortDescription,
    description: data.description,
    basePrice: data.priceType === "QUOTE" ? null : data.basePrice,
    priceType: data.priceType,
    estimatedDurationMinutes: data.estimatedDurationMinutes,
    requiresPhotos: data.requiresPhotos,
    requiresQuote: data.requiresQuote,
    professionalRole: data.professionalRole || null,
    seoTitle: data.seoTitle || null,
    seoDescription: data.seoDescription || null,
    isActive: data.isActive,
    order: data.order,
    included: data.included,
    notIncluded: data.notIncluded,
  };
}

function friendlySlugError(e: unknown): never {
  if (
    e &&
    typeof e === "object" &&
    "code" in e &&
    (e as { code?: string }).code === "P2002"
  ) {
    throw new Error("Já existe um serviço com este slug. Escolha outro.");
  }
  throw e;
}

export async function createService(input: ServiceInput) {
  await requireAdmin();
  const data = serviceSchema.parse(input);
  try {
    const service = await prisma.service.create({
      data: {
        ...scalarData(data),
        extras: { create: data.extras },
        faqs: {
          create: data.faqs.map((f, i) => ({
            question: f.question,
            answer: f.answer,
            order: i,
          })),
        },
      },
      include: { category: { select: { slug: true } } },
    });
    revalidateCatalog(service.category.slug, service.slug);
    return { ok: true, id: service.id };
  } catch (e) {
    friendlySlugError(e);
  }
}

export async function updateService(id: string, input: ServiceInput) {
  await requireAdmin();
  const data = serviceSchema.parse(input);
  try {
    const service = await prisma.$transaction(async (tx) => {
      await tx.serviceExtra.deleteMany({ where: { serviceId: id } });
      await tx.serviceFaq.deleteMany({ where: { serviceId: id } });
      return tx.service.update({
        where: { id },
        data: {
          ...scalarData(data),
          extras: { create: data.extras },
          faqs: {
            create: data.faqs.map((f, i) => ({
              question: f.question,
              answer: f.answer,
              order: i,
            })),
          },
        },
        include: { category: { select: { slug: true } } },
      });
    });
    revalidateCatalog(service.category.slug, service.slug);
    return { ok: true };
  } catch (e) {
    friendlySlugError(e);
  }
}

export async function deleteService(id: string) {
  await requireAdmin();
  const bookings = await prisma.booking.count({ where: { serviceId: id } });
  if (bookings > 0) {
    throw new Error(
      `Este serviço tem ${bookings} pedido(s) associado(s). Desative-o em vez de o apagar, para não perder o histórico.`
    );
  }
  const service = await prisma.service.delete({
    where: { id },
    include: { category: { select: { slug: true } } },
  });
  revalidateCatalog(service.category.slug, service.slug);
  return { ok: true };
}
