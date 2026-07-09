"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateBookingReference } from "@/lib/booking/reference";
import { notifyBookingCreated } from "@/lib/notifications";
import { getServiceBySlug } from "@/lib/data/catalog";
import {
  getAggregatedAvailability,
  matchProfessionals,
  type AggregatedDay,
  type MatchedProfessional,
} from "./matching";
import { bookingSchema, type BookingInput } from "./schema";

export interface AvailabilityResponse {
  aggregated: AggregatedDay[];
  professionals: MatchedProfessional[];
}

export async function getAvailability(args: {
  serviceSlug: string;
  district: string;
  municipality?: string | null;
}): Promise<AvailabilityResponse> {
  const [aggregated, pros] = await Promise.all([
    getAggregatedAvailability(args),
    matchProfessionals(args),
  ]);

  const professionals: MatchedProfessional[] = pros.map((p) => ({
    id: p.id,
    slug: p.slug,
    displayName: p.displayName,
    headline: p.headline,
    photoUrl: p.photoUrl,
    ratingAverage: p.ratingAverage,
    ratingCount: p.ratingCount,
    completedJobs: p.completedJobs,
    isVerified: p.isVerified,
  }));

  return { aggregated, professionals };
}

export interface CreateBookingResult {
  ok: boolean;
  reference?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function createBooking(
  input: BookingInput
): Promise<CreateBookingResult> {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;

  const catalogService = getServiceBySlug(data.serviceSlug);
  const service = await prisma.service.findUnique({
    where: { slug: data.serviceSlug },
  });
  if (!service || !catalogService) {
    return { ok: false, error: "Serviço não encontrado" };
  }

  const user = await getCurrentUser();

  // Resolve schedule & professional
  let scheduledStart: Date | null = null;
  let scheduledEnd: Date | null = null;
  let professionalId: string | null = data.professionalId ?? null;

  if (data.scheduledStartISO) {
    scheduledStart = new Date(data.scheduledStartISO);
    scheduledEnd = new Date(
      scheduledStart.getTime() + service.estimatedDurationMinutes * 60 * 1000
    );

    // If no specific professional chosen, pick the first one free at that slot.
    if (!professionalId) {
      const { aggregated } = await getAvailability({
        serviceSlug: data.serviceSlug,
        district: data.district,
        municipality: data.municipality,
      });
      const day = aggregated.find(
        (d) => d.dateISO === scheduledStart!.toISOString().slice(0, 10)
      );
      const slot = day?.slots.find(
        (s) => s.startISO === scheduledStart!.toISOString()
      );
      professionalId = slot?.professionalIds[0] ?? null;
    }
  }

  const reference = generateBookingReference();

  const booking = await prisma.booking.create({
    data: {
      reference,
      clientId: user?.id ?? null,
      professionalId,
      serviceId: service.id,
      status: "PENDING",
      address: data.address,
      postalCode: data.postalCode,
      city: data.city,
      municipality: data.municipality,
      district: data.district,
      accessNotes: data.accessNotes || null,
      clientDescription: data.clientDescription,
      urgency: data.urgency,
      propertyType: data.propertyType,
      scheduledStart,
      scheduledEnd,
      estimatedPrice: service.basePrice,
      priceType: service.priceType,
      paymentStatus: "NOT_REQUIRED",
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone,
      whatsappConsent: data.whatsappConsent,
      photos: data.photoUrls?.length
        ? { create: data.photoUrls.map((url) => ({ url })) }
        : undefined,
      statusHistory: { create: { status: "PENDING", note: "Pedido criado" } },
    },
    include: { professional: { select: { userId: true } } },
  });

  await notifyBookingCreated({
    professionalUserId: booking.professional?.userId,
    clientEmail: data.clientEmail,
    reference,
    serviceName: service.name,
  });

  return { ok: true, reference };
}
