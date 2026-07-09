"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { notifyUser } from "@/lib/notifications";

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

// --- Choose a professional from the applicants (Fixando model) ---------------
export async function selectProfessional(
  bookingId: string,
  professionalId: string
) {
  const booking = await ownedBooking(bookingId);
  if (booking.professionalId || booking.status !== "PENDING") {
    throw new Error("Este pedido já tem um profissional atribuído");
  }

  const application = await prisma.bookingApplication.findUnique({
    where: { bookingId_professionalId: { bookingId, professionalId } },
    include: { professional: { select: { userId: true, displayName: true } } },
  });
  if (!application || application.status === "WITHDRAWN") {
    throw new Error("Candidatura não encontrada");
  }

  const nextStatus = booking.scheduledStart ? "SCHEDULED" : "ACCEPTED";

  await prisma.$transaction([
    prisma.booking.update({
      where: { id: bookingId },
      data: {
        professionalId,
        status: nextStatus,
        // If the professional proposed a price, use it as the estimate.
        ...(application.proposedPrice != null
          ? { estimatedPrice: application.proposedPrice }
          : {}),
        statusHistory: {
          create: {
            status: nextStatus,
            note: `Profissional escolhido: ${application.professional.displayName}`,
          },
        },
      },
    }),
    prisma.bookingApplication.update({
      where: { id: application.id },
      data: { status: "SELECTED" },
    }),
    // All other applications for this booking become rejected.
    prisma.bookingApplication.updateMany({
      where: { bookingId, id: { not: application.id }, status: "PENDING" },
      data: { status: "REJECTED" },
    }),
  ]);

  // Notify the chosen professional.
  await notifyUser({
    userId: application.professional.userId,
    type: "APPLICATION_SELECTED",
    title: "Foi escolhido para um trabalho!",
    body: `O cliente escolheu-o para o pedido ${booking.reference}.`,
    link: `/profissional/pedidos/${bookingId}`,
  });

  // Notify the professionals who were not chosen.
  const rejected = await prisma.bookingApplication.findMany({
    where: { bookingId, status: "REJECTED" },
    include: { professional: { select: { userId: true } } },
  });
  for (const r of rejected) {
    await notifyUser({
      userId: r.professional.userId,
      type: "GENERIC",
      title: "Pedido atribuído a outro profissional",
      body: `O cliente escolheu outro profissional para o pedido ${booking.reference}.`,
      link: "/profissional/pedidos",
    });
  }

  revalidatePath(`/dashboard/pedidos/${bookingId}`);
  revalidatePath("/profissional/pedidos");
  return { ok: true };
}
