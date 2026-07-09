"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Star,
  ShieldCheck,
  Briefcase,
  Check,
  MessageSquare,
} from "lucide-react";
import type { PriceType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/use-toast";
import { priceLabel } from "@/lib/format";
import { selectProfessional } from "../actions";

export interface Applicant {
  professionalId: string;
  displayName: string;
  slug: string;
  photoUrl: string | null;
  headline: string | null;
  isVerified: boolean;
  ratingAverage: number;
  ratingCount: number;
  completedJobs: number;
  message: string | null;
  proposedPrice: number | null;
}

export function ApplicantsList({
  bookingId,
  applicants,
  fallbackPrice,
  fallbackPriceType,
}: {
  bookingId: string;
  applicants: Applicant[];
  fallbackPrice: number | null;
  fallbackPriceType: PriceType;
}) {
  const router = useRouter();
  const { toast } = useToast();

  async function choose(professionalId: string, name: string) {
    try {
      await selectProfessional(bookingId, professionalId);
      toast({
        title: "Profissional escolhido!",
        description: `${name} vai tratar do seu pedido.`,
      });
      router.refresh();
    } catch (e) {
      toast({
        title: "Erro",
        description: (e as Error).message,
        variant: "destructive",
      });
    }
  }

  if (applicants.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-card p-6 text-center">
        <p className="font-medium">Ainda sem candidaturas</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Os profissionais da sua zona vão candidatar-se em breve. Avisamos
          assim que houver interessados — depois escolhe o que preferir.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">
          {applicants.length} profissional{applicants.length > 1 ? "is" : ""}{" "}
          interessado
          {applicants.length > 1 ? "s" : ""}
        </h2>
        <span className="text-xs text-muted-foreground">
          Escolha o que preferir
        </span>
      </div>

      {applicants.map((a) => (
        <div key={a.professionalId} className="rounded-xl border bg-card p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-semibold text-primary">
              {a.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={a.photoUrl}
                  alt={a.displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                a.displayName.charAt(0)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/profissionais/${a.slug}`}
                  className="font-semibold hover:underline"
                >
                  {a.displayName}
                </Link>
                {a.isVerified && (
                  <span className="flex items-center gap-0.5 text-xs text-primary">
                    <ShieldCheck className="h-3.5 w-3.5" /> Verificado
                  </span>
                )}
              </div>
              {a.headline && (
                <p className="text-sm text-muted-foreground">{a.headline}</p>
              )}
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <Star className="h-3.5 w-3.5 fill-warm text-warm" />
                  {a.ratingAverage.toFixed(1)} ({a.ratingCount})
                </span>
                <span className="flex items-center gap-0.5">
                  <Briefcase className="h-3.5 w-3.5" /> {a.completedJobs}{" "}
                  serviços
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Proposta</p>
              <p className="font-semibold text-primary">
                {a.proposedPrice != null
                  ? priceLabel(a.proposedPrice, "STARTING")
                  : priceLabel(fallbackPrice, fallbackPriceType)}
              </p>
            </div>
          </div>

          {a.message && (
            <p className="mt-3 flex gap-2 rounded-lg bg-muted/40 p-3 text-sm">
              <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="whitespace-pre-line">{a.message}</span>
            </p>
          )}

          <div className="mt-3 flex justify-end gap-2">
            <Link href={`/profissionais/${a.slug}`}>
              <Button variant="outline" size="sm">
                Ver perfil
              </Button>
            </Link>
            <ConfirmDialog
              title="Escolher este profissional?"
              description={`Vai escolher ${a.displayName} para este serviço. Os restantes candidatos serão avisados de que a vaga foi preenchida.`}
              confirmLabel="Escolher"
              onConfirm={() => choose(a.professionalId, a.displayName)}
              trigger={
                <Button size="sm">
                  <Check className="mr-1 h-4 w-4" /> Escolher
                </Button>
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
}
