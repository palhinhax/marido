import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Loads the professional profile for the logged-in user, or redirects.
export async function getCurrentProfessional() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const profile = await prisma.professionalProfile.findUnique({
    where: { userId: user.id },
  });
  if (!profile) {
    // Not a professional account
    redirect("/dashboard");
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
