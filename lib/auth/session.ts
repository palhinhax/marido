import { redirect } from "next/navigation";
import { auth } from "./config";
import type { Role } from "@prisma/client";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

// Landing route for each role after login.
export function dashboardPathForRole(role: Role): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "PROFESSIONAL":
      return "/profissional";
    default:
      return "/dashboard";
  }
}

// Require a logged-in user; optionally restrict to specific roles.
export async function requireUser(roles?: Role[]) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (roles && !roles.includes(user.role)) {
    redirect(dashboardPathForRole(user.role));
  }
  return user;
}
