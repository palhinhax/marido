"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { gridToRules, type GridSelection } from "@/lib/availability";
import {
  notifyBookingAccepted,
  notifyBookingRejected,
  notifyBookingCompleted,
} from "@/lib/notifications";
import { DISTRICTS } from "@/lib/data/locations";
import type { BookingStatus } from "@prisma/client";

async function requireProfessionalId(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Sessão inválida");
  const profile = await prisma.professionalProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!profile) throw new Error("Perfil de profissional não encontrado");
  return profile.id;
}

// --- Profile -----------------------------------------------------------------
const profileSchema = z.object({
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

export async function updateProfessionalProfile(
  input: z.infer<typeof profileSchema>
) {
  const id = await requireProfessionalId();
  const data = profileSchema.parse(input);
  await prisma.professionalProfile.update({
    where: { id },
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
  revalidatePath("/profissional/perfil");
  return { ok: true };
}

// --- Services ----------------------------------------------------------------
export async function setProfessionalServices(serviceIds: string[]) {
  const id = await requireProfessionalId();
  await prisma.$transaction([
    prisma.professionalService.deleteMany({ where: { professionalId: id } }),
    prisma.professionalService.createMany({
      data: serviceIds.map((serviceId) => ({ professionalId: id, serviceId })),
      skipDuplicates: true,
    }),
  ]);
  revalidatePath("/profissional/servicos");
  return { ok: true };
}

// --- Areas -------------------------------------------------------------------
const areaSchema = z.array(
  z.object({ district: z.string(), municipality: z.string().nullable() })
);

export async function setProfessionalAreas(areas: z.infer<typeof areaSchema>) {
  const id = await requireProfessionalId();
  const parsed = areaSchema.parse(areas);
  const withSlugs = parsed.map((a) => {
    const district = DISTRICTS.find((d) => d.name === a.district);
    const muni = a.municipality
      ? district?.municipalities.find((m) => m.name === a.municipality)
      : undefined;
    return {
      professionalId: id,
      district: a.district,
      municipality: a.municipality,
      municipalitySlug: muni?.slug ?? null,
    };
  });
  await prisma.$transaction([
    prisma.professionalServiceArea.deleteMany({
      where: { professionalId: id },
    }),
    prisma.professionalServiceArea.createMany({ data: withSlugs }),
  ]);
  revalidatePath("/profissional/areas");
  return { ok: true };
}

// --- Availability ------------------------------------------------------------
export async function saveAvailability(
  selection: GridSelection,
  hours: number[]
) {
  const id = await requireProfessionalId();
  const rules = gridToRules(selection, hours);
  await prisma.$transaction([
    prisma.availabilityRule.deleteMany({ where: { professionalId: id } }),
    prisma.availabilityRule.createMany({
      data: rules.map((r) => ({
        professionalId: id,
        dayOfWeek: r.dayOfWeek,
        startTime: r.startTime,
        endTime: r.endTime,
        slotDurationMinutes: 60,
        isAvailable: true,
      })),
    }),
  ]);
  revalidatePath("/profissional/disponibilidade");
  return { ok: true };
}

export async function addAvailabilityException(input: {
  dateISO: string;
  type: "AVAILABLE" | "UNAVAILABLE";
  startTime?: string;
  endTime?: string;
  reason?: string;
}) {
  const id = await requireProfessionalId();
  await prisma.availabilityException.create({
    data: {
      professionalId: id,
      date: new Date(input.dateISO),
      type: input.type,
      startTime: input.startTime || null,
      endTime: input.endTime || null,
      reason: input.reason || null,
    },
  });
  revalidatePath("/profissional/disponibilidade");
  return { ok: true };
}

export async function removeAvailabilityException(exceptionId: string) {
  const id = await requireProfessionalId();
  await prisma.availabilityException.deleteMany({
    where: { id: exceptionId, professionalId: id },
  });
  revalidatePath("/profissional/disponibilidade");
  return { ok: true };
}

// --- Booking responses -------------------------------------------------------
export async function respondToBooking(
  bookingId: string,
  action: "ACCEPT" | "REJECT" | "START" | "COMPLETE" | "NO_SHOW"
) {
  const professionalId = await requireProfessionalId();
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: { select: { name: true } },
      client: { select: { id: true } },
    },
  });
  if (!booking) throw new Error("Pedido não encontrado");

  // Allow acting if unassigned or assigned to this professional.
  if (booking.professionalId && booking.professionalId !== professionalId) {
    throw new Error("Este pedido está atribuído a outro profissional");
  }

  const map: Record<typeof action, { status: BookingStatus; note: string }> = {
    ACCEPT: { status: "ACCEPTED", note: "Pedido aceite pelo profissional" },
    REJECT: { status: "REJECTED", note: "Pedido recusado" },
    START: { status: "IN_PROGRESS", note: "Serviço iniciado" },
    COMPLETE: { status: "COMPLETED", note: "Serviço concluído" },
    NO_SHOW: { status: "NO_SHOW", note: "Cliente não compareceu" },
  };
  const next = map[action];

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: next.status,
        professionalId:
          action === "ACCEPT" ? professionalId : booking.professionalId,
        statusHistory: { create: { status: next.status, note: next.note } },
      },
    });
    if (action === "COMPLETE") {
      await tx.professionalProfile.update({
        where: { id: professionalId },
        data: { completedJobs: { increment: 1 } },
      });
    }
  });

  // Notifications
  if (action === "ACCEPT") {
    await notifyBookingAccepted({
      clientUserId: booking.client?.id,
      clientEmail: booking.clientEmail,
      reference: booking.reference,
    });
  } else if (action === "REJECT") {
    await notifyBookingRejected({
      clientUserId: booking.client?.id,
      clientEmail: booking.clientEmail,
      reference: booking.reference,
    });
  } else if (action === "COMPLETE") {
    await notifyBookingCompleted({
      clientUserId: booking.client?.id,
      clientEmail: booking.clientEmail,
      reference: booking.reference,
    });
  }

  revalidatePath("/profissional/pedidos");
  revalidatePath(`/profissional/pedidos/${bookingId}`);
  return { ok: true };
}

// --- Claim an unassigned booking ---------------------------------------------
export async function claimBooking(bookingId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Sessão inválida");
  const pro = await prisma.professionalProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, approvalStatus: true },
  });
  if (!pro) throw new Error("Perfil de profissional não encontrado");
  if (pro.approvalStatus !== "APPROVED") {
    throw new Error("A sua conta ainda não foi aprovada");
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: { select: { slug: true, name: true } },
      client: { select: { id: true } },
    },
  });
  if (!booking) throw new Error("Pedido não encontrado");
  if (booking.professionalId) {
    throw new Error("Este pedido já foi atribuído a outro profissional");
  }

  // Eligibility: professional must offer the service and cover the area.
  const [offersService, coversArea] = await Promise.all([
    prisma.professionalService.findFirst({
      where: {
        professionalId: pro.id,
        service: { slug: booking.service.slug },
      },
      select: { id: true },
    }),
    prisma.professionalServiceArea.findFirst({
      where: {
        professionalId: pro.id,
        district: booking.district,
        OR: [{ municipality: null }, { municipality: booking.municipality }],
      },
      select: { id: true },
    }),
  ]);
  if (!offersService) throw new Error("Não oferece este serviço");
  if (!coversArea) throw new Error("Este pedido está fora da sua área");

  // Atomic claim — only succeeds if still unassigned and pending.
  const result = await prisma.booking.updateMany({
    where: { id: bookingId, professionalId: null, status: "PENDING" },
    data: { professionalId: pro.id, status: "ACCEPTED" },
  });
  if (result.count === 0) {
    throw new Error("Este pedido já foi atribuído a outro profissional");
  }

  await prisma.bookingStatusHistory.create({
    data: {
      bookingId,
      status: "ACCEPTED",
      note: "Pedido aceite pelo profissional",
    },
  });
  await notifyBookingAccepted({
    clientUserId: booking.client?.id,
    clientEmail: booking.clientEmail,
    reference: booking.reference,
  });

  revalidatePath("/profissional");
  revalidatePath("/profissional/pedidos");
  revalidatePath(`/profissional/pedidos/${bookingId}`);
  return { ok: true };
}

// --- Onboarding --------------------------------------------------------------
export async function setOnboardingStep(step: number) {
  const id = await requireProfessionalId();
  await prisma.professionalProfile.update({
    where: { id },
    data: { onboardingStep: step },
  });
  return { ok: true };
}

export async function finishOnboarding() {
  const id = await requireProfessionalId();
  await prisma.professionalProfile.update({
    where: { id },
    data: { onboardingStep: 7 },
  });
  revalidatePath("/profissional");
  return { ok: true };
}
