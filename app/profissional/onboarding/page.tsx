import { UploadCloud } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentProfessional } from "@/features/professional/queries";
import { ProfileForm } from "@/features/professional/components/profile-form";
import { ServicesManager } from "@/features/professional/components/services-manager";
import { AreasManager } from "@/features/professional/components/areas-manager";
import { WeeklyAvailabilityGrid } from "@/features/professional/components/weekly-availability-grid";
import { FinishOnboardingButton } from "@/features/professional/components/finish-onboarding-button";
import { rulesToGrid } from "@/lib/availability";
import { CATALOG } from "@/lib/data/catalog";

export const dynamic = "force-dynamic";

const HOURS = Array.from({ length: 15 }, (_, i) => i + 7);

function Step({
  n,
  title,
  description,
  children,
}: {
  n: number;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-card p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          {n}
        </span>
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default async function OnboardingPage() {
  const pro = await getCurrentProfessional();
  const [services, selectedServices, areas, rules] = await Promise.all([
    prisma.service.findMany({
      include: { category: { select: { slug: true } } },
    }),
    prisma.professionalService.findMany({
      where: { professionalId: pro.id },
      select: { serviceId: true },
    }),
    prisma.professionalServiceArea.findMany({
      where: { professionalId: pro.id },
      select: { district: true, municipality: true },
    }),
    prisma.availabilityRule.findMany({ where: { professionalId: pro.id } }),
  ]);

  const groups = CATALOG.map((c) => ({
    category: c.name,
    items: services
      .filter((s) => s.category.slug === c.slug)
      .map((s) => ({ id: s.id, name: s.name })),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurar o seu perfil</h1>
        <p className="text-muted-foreground">
          Complete os passos abaixo. Guarde cada secção. No final, submeta para
          aprovação.
        </p>
      </div>

      <Step
        n={1}
        title="Dados do perfil"
        description="Como os clientes o vão ver."
      >
        <ProfileForm
          initial={{
            displayName: pro.displayName,
            headline: pro.headline ?? "",
            description: pro.description ?? "",
            photoUrl: pro.photoUrl ?? "",
            phone: pro.phone ?? "",
            whatsapp: pro.whatsapp ?? "",
            website: pro.website ?? "",
            nif: pro.nif ?? "",
            companyName: pro.companyName ?? "",
            yearsExperience: pro.yearsExperience ?? "",
          }}
        />
      </Step>

      <Step n={2} title="Serviços" description="Escolha os serviços que faz.">
        <ServicesManager
          groups={groups}
          initialSelected={selectedServices.map((s) => s.serviceId)}
        />
      </Step>

      <Step n={3} title="Áreas de serviço" description="Onde trabalha.">
        <AreasManager initialAreas={areas} />
      </Step>

      <Step n={4} title="Disponibilidade" description="Quando está disponível.">
        <WeeklyAvailabilityGrid
          initialSelection={rulesToGrid(rules)}
          hours={HOURS}
          exceptions={[]}
        />
      </Step>

      <Step
        n={5}
        title="Verificação (opcional)"
        description="Documentos para ganhar o selo de verificado."
      >
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground hover:bg-muted/50">
          <UploadCloud className="h-6 w-6" />
          Enviar documentos (BI/CC, seguro, certificados)
          <input type="file" multiple className="hidden" />
        </label>
        <p className="mt-2 text-xs text-muted-foreground">
          O envio de documentos ficará disponível em breve. Pode submeter o
          perfil sem este passo — a verificação pode ser feita mais tarde.
        </p>
      </Step>

      <div className="rounded-2xl border bg-accent/40 p-6 text-center">
        <h2 className="text-lg font-bold">Tudo pronto?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ao submeter, a nossa equipa analisa o seu perfil. Só recebe pedidos
          após aprovação.
        </p>
        <div className="mt-4 flex justify-center">
          <FinishOnboardingButton />
        </div>
      </div>
    </div>
  );
}
