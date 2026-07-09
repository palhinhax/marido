import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import type { Prisma } from "@prisma/client";

// Prisma OR clause matching a booking location against a professional's areas.
function areaMatchClause(
  areas: { district: string; municipality: string | null }[]
): Prisma.BookingWhereInput["OR"] {
  return areas.map((a) =>
    a.municipality
      ? { district: a.district, municipality: a.municipality }
      : { district: a.district }
  );
}

// Unassigned PENDING bookings a professional is eligible to claim:
// matches one of their services AND falls within one of their service areas.
export async function getClaimableBookings(professionalId: string, take = 20) {
  const [services, areas] = await Promise.all([
    prisma.professionalService.findMany({
      where: { professionalId },
      select: { service: { select: { slug: true } } },
    }),
    prisma.professionalServiceArea.findMany({
      where: { professionalId },
      select: { district: true, municipality: true },
    }),
  ]);
  if (services.length === 0 || areas.length === 0) return [];

  return prisma.booking.findMany({
    where: {
      professionalId: null,
      status: "PENDING",
      service: { slug: { in: services.map((s) => s.service.slug) } },
      OR: areaMatchClause(areas),
    },
    include: {
      service: { select: { name: true, estimatedDurationMinutes: true } },
      _count: { select: { photos: true, applications: true } },
      // The current professional's own application (if any) to show state.
      applications: {
        where: { professionalId, status: { not: "WITHDRAWN" } },
        select: { status: true, proposedPrice: true, message: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take,
  });
}

// The professional's own applications, for an "As minhas candidaturas" view.
export async function getProfessionalApplications(professionalId: string) {
  return prisma.bookingApplication.findMany({
    where: {
      professionalId,
      status: { in: ["PENDING", "SELECTED", "REJECTED"] },
    },
    include: {
      booking: {
        select: {
          id: true,
          reference: true,
          status: true,
          municipality: true,
          district: true,
          scheduledStart: true,
          estimatedPrice: true,
          priceType: true,
          urgency: true,
          professionalId: true,
          service: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// Loads the professional profile for the logged-in user, or redirects.
export async function getCurrentProfessional() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const profile = await prisma.professionalProfile.findUnique({
    where: { userId: user.id },
  });
  if (!profile) {
    // No professional profile yet (e.g. an admin who hasn't created one).
    // Send them to create/activate one rather than bouncing to the client area.
    redirect("/registar/profissional");
  }
  return profile;
}

// Progress across the profile setup, for the completion meter.
export async function getProfileCompletion(professionalId: string) {
  const [profile, servicesCount, areasCount, rulesCount] = await Promise.all([
    prisma.professionalProfile.findUnique({ where: { id: professionalId } }),
    prisma.professionalService.count({ where: { professionalId } }),
    prisma.professionalServiceArea.count({ where: { professionalId } }),
    prisma.availabilityRule.count({ where: { professionalId } }),
  ]);

  const checks = [
    {
      label: "Dados do perfil",
      done: Boolean(profile?.headline && profile?.description),
    },
    { label: "Serviços selecionados", done: servicesCount > 0 },
    { label: "Áreas de serviço", done: areasCount > 0 },
    { label: "Disponibilidade definida", done: rulesCount > 0 },
  ];
  const done = checks.filter((c) => c.done).length;
  return {
    checks,
    done,
    total: checks.length,
    percent: Math.round((done / checks.length) * 100),
  };
}
