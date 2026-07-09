import { requireUser } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser(["ADMIN"]);
  return <DashboardShell area="admin">{children}</DashboardShell>;
}
