import { requireUser } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser(["CLIENT"]);
  return <DashboardShell area="client">{children}</DashboardShell>;
}
