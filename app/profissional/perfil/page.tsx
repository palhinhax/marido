import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { getCurrentProfessional } from "@/features/professional/queries";
import { ProfileForm } from "@/features/professional/components/profile-form";
import { APPROVAL_STATUS_LABEL } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ProfessionalProfilePage() {
  const pro = await getCurrentProfessional();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">O meu perfil</h1>
          <div className="mt-1 flex items-center gap-2 text-sm">
            <Badge
              variant={pro.approvalStatus === "APPROVED" ? "success" : "warm"}
            >
              {APPROVAL_STATUS_LABEL[pro.approvalStatus]}
            </Badge>
            {pro.approvalStatus === "APPROVED" && (
              <Link
                href={`/profissionais/${pro.slug}`}
                className="flex items-center gap-1 text-primary hover:underline"
              >
                Ver perfil público <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>

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
    </div>
  );
}
