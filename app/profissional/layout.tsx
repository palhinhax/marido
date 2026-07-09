import { requireUser } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function ProfessionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser(["PROFESSIONAL", "ADMIN"]);
  return <DashboardShell area="professional">{children}</DashboardShell>;
}
