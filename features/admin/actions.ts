"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { BookingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { notifyUser } from "@/lib/notifications";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("Sem permissões");
  return user;
}

// --- Professionals -----------------------------------------------------------
export async function setProfessionalApproval(
  professionalId: string,
  status: "APPROVED" | "REJECTED" | "PENDING"
) {
  await requireAdmin();
  const pro = await prisma.professionalProfile.update({
    where: { id: professionalId },
    data: {
      approvalStatus: status,
      isVerified: status === "APPROVED" ? true : undefined,
    },
    select: { userId: true },
  });
  await notifyUser({
    userId: pro.userId,
    type: "GENERIC",
    title:
      status === "APPROVED"
        ? "Conta aprovada!"
        : status === "REJECTED"
          ? "Conta não aprovada"
          : "Conta em revisão",
    body:
      status === "APPROVED"
        ? "Já pode começar a receber pedidos."
        : status === "REJECTED"
          ? "Contacte-nos para mais informações."
          : undefined,
    link: "/profissional",
  });
  revalidatePath("/admin/profissionais");
  return { ok: true };
}

export async function toggleProfessionalFeatured(professionalId: string) {
  await requireAdmin();
  const pro = await prisma.professionalProfile.findUnique({
    where: { id: professionalId },
    select: { isFeatured: true },
  });
  await prisma.professionalProfile.update({
    where: { id: professionalId },
    data: { isFeatured: !pro?.isFeatured },
  });
  revalidatePath("/admin/profissionais");
  return { ok: true };
}

const adminProfileSchema = z.object({
  displayName: z.string().min(2),
  headline: z.string().max(120).optional().or(z.literal("")),
  description: z.string().max(2000).optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  whatsapp: z.string().optional().or(z.literal("")),
  website: z.string().optional().or(z.literal("")),
  nif: z.string().optional().or(z.literal("")),
  companyName: z.string().optional().or(z.literal("")),
  yearsExperience: z.coerce.number().int().min(0).max(70).optional(),
});

export async function adminUpdateProfessional(
  professionalId: string,
  input: z.infer<typeof adminProfileSchema>
) {
  await requireAdmin();
  const data = adminProfileSchema.parse(input);
  await prisma.professionalProfile.update({
    where: { id: professionalId },
    data: {
      displayName: data.displayName,
      headline: data.headline || null,
      description: data.description || null,
      phone: data.phone || null,
      whatsapp: data.whatsapp || null,
      website: data.website || null,
      nif: data.nif || null,
      companyName: data.companyName || null,
      yearsExperience: data.yearsExperience ?? null,
    },
  });
  revalidatePath("/admin/profissionais");
  revalidatePath(`/admin/profissionais/${professionalId}`);
  return { ok: true };
}

export async function deleteProfessional(professionalId: string) {
  await requireAdmin();
  const pro = await prisma.professionalProfile.findUnique({
    where: { id: professionalId },
    select: { userId: true },
  });
  if (!pro) throw new Error("Profissional não encontrado");
  // Deleting the user cascades the professional profile, its services, areas,
  // availability, documents and reviews. Bookings are kept with the professional
  // detached (professionalId set to null).
  await prisma.user.delete({ where: { id: pro.userId } });
  revalidatePath("/admin/profissionais");
  return { ok: true };
}

// --- Users -------------------------------------------------------------------
export async function deleteUser(userId: string) {
  const admin = await requireAdmin();
  if (admin.id === userId) {
    throw new Error("Não pode apagar a sua própria conta.");
  }
  // Cascades client/professional profiles, reviews written and notifications.
  // Bookings (as client or professional) are kept, detached (ids set to null).
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/clientes");
  return { ok: true };
}

// --- Reviews -----------------------------------------------------------------
export async function setReviewApproval(reviewId: string, approved: boolean) {
  await requireAdmin();
  const review = await prisma.review.update({
    where: { id: reviewId },
    data: { isApproved: approved },
    select: { professionalId: true },
  });
  // Recompute aggregate using only approved reviews.
  const agg = await prisma.review.aggregate({
    where: { professionalId: review.professionalId, isApproved: true },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.professionalProfile.update({
    where: { id: review.professionalId },
    data: { ratingAverage: agg._avg.rating ?? 0, ratingCount: agg._count },
  });
  revalidatePath("/admin/avaliacoes");
  return { ok: true };
}

export async function deleteReview(reviewId: string) {
  await requireAdmin();
  const review = await prisma.review.delete({
    where: { id: reviewId },
    select: { professionalId: true },
  });
  const agg = await prisma.review.aggregate({
    where: { professionalId: review.professionalId, isApproved: true },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.professionalProfile.update({
    where: { id: review.professionalId },
    data: { ratingAverage: agg._avg.rating ?? 0, ratingCount: agg._count },
  });
  revalidatePath("/admin/avaliacoes");
  return { ok: true };
}

// --- Services ----------------------------------------------------------------
export async function toggleServiceActive(serviceId: string) {
  await requireAdmin();
  const s = await prisma.service.findUnique({
    where: { id: serviceId },
    select: { isActive: true },
  });
  await prisma.service.update({
    where: { id: serviceId },
    data: { isActive: !s?.isActive },
  });
  revalidatePath("/admin/servicos");
  return { ok: true };
}

export async function updateServicePrice(
  serviceId: string,
  basePrice: number | null
) {
  await requireAdmin();
  await prisma.service.update({
    where: { id: serviceId },
    data: { basePrice },
  });
  revalidatePath("/admin/servicos");
  return { ok: true };
}

// --- Bookings ----------------------------------------------------------------
export async function adminUpdateBookingStatus(
  bookingId: string,
  status: BookingStatus,
  note?: string
) {
  await requireAdmin();
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status,
      statusHistory: {
        create: {
          status,
          note: note?.trim() || "Atualizado pela administração",
        },
      },
    },
  });
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${bookingId}`);
  return { ok: true };
}

export async function deleteBooking(bookingId: string) {
  await requireAdmin();

  const review = await prisma.review.findUnique({
    where: { bookingId },
    select: { professionalId: true },
  });

  await prisma.booking.delete({ where: { id: bookingId } });

  if (review) {
    const agg = await prisma.review.aggregate({
      where: { professionalId: review.professionalId, isApproved: true },
      _avg: { rating: true },
      _count: true,
    });
    await prisma.professionalProfile.update({
      where: { id: review.professionalId },
      data: { ratingAverage: agg._avg.rating ?? 0, ratingCount: agg._count },
    });
    revalidatePath("/admin/avaliacoes");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
  return { ok: true };
}
