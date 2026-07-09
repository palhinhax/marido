import type { Role } from "@prisma/client";

// Areas of the app, in increasing privilege.
export type Area = "client" | "professional" | "admin";

// Role hierarchy: PROFESSIONAL ⊇ CLIENT, ADMIN ⊇ PROFESSIONAL ⊇ CLIENT.
// Everyone is a client; professionals and admins also get the professional
// area; only admins get the admin area.
export function canAccessArea(
  role: Role | undefined | null,
  area: Area
): boolean {
  if (!role) return false;
  if (area === "client") return true;
  if (area === "professional")
    return role === "PROFESSIONAL" || role === "ADMIN";
  return role === "ADMIN";
}

export function accessibleAreas(role: Role | undefined | null): Area[] {
  return (["client", "professional", "admin"] as Area[]).filter((a) =>
    canAccessArea(role, a)
  );
}

export const AREA_META: Record<Area, { label: string; href: string }> = {
  client: { label: "Cliente", href: "/dashboard" },
  professional: { label: "Profissional", href: "/profissional" },
  admin: { label: "Admin", href: "/admin" },
};
