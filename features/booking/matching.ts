import { prisma } from "@/lib/prisma";
import { computeDaySlots, type Slot } from "@/lib/availability";
import { getServiceBySlug } from "@/lib/data/catalog";

// Statuses that occupy a professional's calendar.
const OCCUPYING = ["ACCEPTED", "SCHEDULED", "IN_PROGRESS"] as const;

export interface MatchedProfessional {
  id: string;
  slug: string;
  displayName: string;
  headline: string | null;
  photoUrl: string | null;
  ratingAverage: number;
  ratingCount: number;
  completedJobs: number;
  isVerified: boolean;
}

// Find approved professionals who provide the service and cover the location.
export async function matchProfessionals(args: {
  serviceSlug: string;
  district: string;
  municipality?: string | null;
}) {
  return prisma.professionalProfile.findMany({
    where: {
      approvalStatus: "APPROVED",
      services: { some: { service: { slug: args.serviceSlug } } },
      serviceAreas: {
        some: {
          district: args.district,
          OR: [
            { municipality: null },
            ...(args.municipality ? [{ municipality: args.municipality }] : []),
          ],
        },
      },
    },
    include: {
      availability: true,
      exceptions: { where: { date: { gte: startOfToday() } } },
      bookings: {
        where: {
          status: { in: [...OCCUPYING] },
          scheduledStart: { gte: startOfToday() },
        },
        select: { scheduledStart: true, scheduledEnd: true },
      },
    },
  });
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export interface AggregatedDay {
  dateISO: string;
  label: string;
  slots: {
    startISO: string;
    label: string;
    professionalIds: string[];
  }[];
}

// Aggregate bookable slots across all matched professionals for the next N days.
// A slot is offered if at least one professional is free for it.
export async function getAggregatedAvailability(args: {
  serviceSlug: string;
  district: string;
  municipality?: string | null;
  days?: number;
}): Promise<AggregatedDay[]> {
  const service = getServiceBySlug(args.serviceSlug);
  if (!service) return [];
  const duration = service.estimatedDurationMinutes;
  const days = args.days ?? 14;

  const pros = await matchProfessionals(args);
  const now = new Date();
  const from = startOfToday();

  const byDate = new Map<
    string,
    Map<string, { label: string; proIds: Set<string> }>
  >();

  for (const pro of pros) {
    for (let i = 0; i < days; i++) {
      const date = new Date(from);
      date.setDate(date.getDate() + i);
      const slots: Slot[] = computeDaySlots({
        rules: pro.availability,
        exceptions: pro.exceptions,
        bookings: pro.bookings,
        date,
        serviceDurationMinutes: duration,
        now,
      });
      for (const s of slots) {
        const dateKey = s.start.toISOString().slice(0, 10);
        if (!byDate.has(dateKey)) byDate.set(dateKey, new Map());
        const dayMap = byDate.get(dateKey)!;
        const startISO = s.start.toISOString();
        if (!dayMap.has(startISO))
          dayMap.set(startISO, { label: s.label, proIds: new Set() });
        dayMap.get(startISO)!.proIds.add(pro.id);
      }
    }
  }

  const result: AggregatedDay[] = [];
  for (const [dateKey, dayMap] of [...byDate.entries()].sort()) {
    const slots = [...dayMap.entries()].sort().map(([startISO, v]) => ({
      startISO,
      label: v.label,
      professionalIds: [...v.proIds],
    }));
    result.push({
      dateISO: dateKey,
      label: new Intl.DateTimeFormat("pt-PT", {
        weekday: "short",
        day: "2-digit",
        month: "short",
      }).format(new Date(dateKey + "T00:00:00")),
      slots,
    });
  }

  return result;
}
