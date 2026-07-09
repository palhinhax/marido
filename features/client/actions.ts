"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

async function requireUserId(): Promise<{ id: string; email: string }> {
  const user = await getCurrentUser();
  if (!user?.id || !user.email) throw new Error("Sessão inválida");
  return { id: user.id, email: user.email };
}

// Ensure the booking belongs to the current user (by id or original email).
async function ownedBooking(bookingId: string) {
  const { id, email } = await requireUserId();
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || (booking.clientId !== id && booking.clientEmail !== email)) {
    throw new Error("Pedido não encontrado");
  }
  return booking;
}

export async function cancelBooking(bookingId: string) {
  const booking = await ownedBooking(bookingId);
  const cancellable = [
    "PENDING",
    "ACCEPTED",
    "SCHEDULED",
    "RESCHEDULE_REQUESTED",
  ];
  if (!cancellable.includes(booking.status)) {
    throw new Error("Este pedido já não pode ser cancelado");
  }
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CANCELLED",
      statusHistory: {
        create: { status: "CANCELLED", note: "Cancelado pelo cliente" },
      },
    },
  });
  revalidatePath("/dashboard/pedidos");
  revalidatePath(`/dashboard/pedidos/${bookingId}`);
  return { ok: true };
}

export async function requestReschedule(bookingId: string, note: string) {
  const booking = await ownedBooking(bookingId);
  if (!["PENDING", "ACCEPTED", "SCHEDULED"].includes(booking.status)) {
    throw new Error("Não é possível reagendar este pedido");
  }
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "RESCHEDULE_REQUESTED",
      statusHistory: {
        create: {
          status: "RESCHEDULE_REQUESTED",
          note: note || "Reagendamento pedido pelo cliente",
        },
      },
    },
  });
  revalidatePath(`/dashboard/pedidos/${bookingId}`);
  return { ok: true };
}

const reviewSchema = z.object({
  bookingId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export async function submitReview(input: z.infer<typeof reviewSchema>) {
  const { id: userId } = await requireUserId();
  const data = reviewSchema.parse(input);
  const booking = await ownedBooking(data.bookingId);

  if (booking.status !== "COMPLETED")
    throw new Error("Só pode avaliar serviços concluídos");
  if (!booking.professionalId)
    throw new Error("Este pedido não tem profissional atribuído");

  const existing = await prisma.review.findUnique({
    where: { bookingId: booking.id },
  });
  if (existing) throw new Error("Já avaliou este serviço");

  await prisma.review.create({
    data: {
      bookingId: booking.id,
      clientId: userId,
      professionalId: booking.professionalId,
      rating: data.rating,
      comment: data.comment || null,
    },
  });

  // Recompute the professional's aggregate rating.
  const agg = await prisma.review.aggregate({
    where: { professionalId: booking.professionalId, isApproved: true },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.professionalProfile.update({
    where: { id: booking.professionalId },
    data: {
      ratingAverage: agg._avg.rating ?? 0,
      ratingCount: agg._count,
    },
  });

  revalidatePath(`/dashboard/pedidos/${booking.id}`);
  return { ok: true };
}

const clientProfileSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional().or(z.literal("")),
});

export async function updateClientProfile(
  input: z.infer<typeof clientProfileSchema>
) {
  const { id } = await requireUserId();
  const data = clientProfileSchema.parse(input);
  await prisma.user.update({
    where: { id },
    data: {
      name: data.name,
      phone: data.phone || null,
      clientProfile: {
        upsert: {
          create: { phone: data.phone || null },
          update: { phone: data.phone || null },
        },
      },
    },
  });
  revalidatePath("/dashboard/perfil");
  return { ok: true };
}
