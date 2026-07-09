import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ClientProfileForm } from "@/features/client/components/client-profile-form";

export const dynamic = "force-dynamic";

export default async function ClientProfilePage() {
  const user = await requireUser();
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true, email: true, phone: true },
  });

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">O meu perfil</h1>
        <p className="text-muted-foreground">Os seus dados de contacto.</p>
      </div>
      <ClientProfileForm
        initial={{
          name: dbUser?.name ?? "",
          email: dbUser?.email ?? "",
          phone: dbUser?.phone ?? "",
        }}
      />
    </div>
  );
}
