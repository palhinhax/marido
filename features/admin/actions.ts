"use server";

import { revalidatePath } from "next/cache";
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
  status: "PENDING" | "ACCEPTED" | "SCHEDULED" | "COMPLETED" | "CANCELLED"
) {
  await requireAdmin();
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status,
      statusHistory: {
        create: { status, note: "Atualizado pela administração" },
      },
    },
  });
  revalidatePath("/admin/pedidos");
  return { ok: true };
}
