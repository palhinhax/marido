import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export function clientBookingWhere(
  userId: string,
  email: string
): Prisma.BookingWhereInput {
  return { OR: [{ clientId: userId }, { clientEmail: email }] };
}

export async function getClientBookings(userId: string, email: string) {
  return prisma.booking.findMany({
    where: clientBookingWhere(userId, email),
    include: {
      service: { select: { name: true } },
      professional: { select: { displayName: true, slug: true } },
    },
    orderBy: [{ createdAt: "desc" }],
  });
}
