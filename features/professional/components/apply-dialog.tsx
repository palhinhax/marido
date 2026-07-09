"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  Loader2,
  MapPin,
  Clock,
  Wallet,
  Home,
  AlertCircle,
  Timer,
  Camera,
  CheckCircle2,
  Users,
} from "lucide-react";
import type {
  PriceType,
  Urgency,
  PropertyType,
  ApplicationStatus,
} from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  priceLabel,
  formatDateTime,
  durationLabel,
  URGENCY_LABEL,
  PROPERTY_TYPE_LABEL,
} from "@/lib/format";
import { applyToBooking, withdrawApplication } from "../actions";

export interface ApplyBookingData {
  id: string;
  reference: string;
  serviceName: string;
  estimatedPrice: number | null;
  priceType: PriceType;
  urgency: Urgency;
  scheduledStart: Date | string | null;
  district: string;
  municipality: string;
  propertyType: PropertyType;
  durationMinutes: number;
  description: string;
  photoCount?: number;
  applicantCount?: number;
}

type AppStatus = ApplicationStatus | null;

// The professional reviews an open request and sends a candidatura (with an
// optional message and price proposal). The client then chooses.
export function ApplyDialog({
  booking,
  applied = null,
  size = "sm",
}: {
  booking: ApplyBookingData;
  applied?: AppStatus;
  size?: "sm" | "default";
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [price, setPrice] = useState("");
  const [pending, start] = useTransition();

  const hasApplied = applied === "PENDING";

  function submit() {
    start(async () => {
      try {
        await applyToBooking({
          bookingId: booking.id,
          message: message || undefined,
          proposedPrice: price === "" ? undefined : Number(price),
        });
        setOpen(false);
        toast({
          title: "Candidatura enviada!",
          description:
            "O cliente vai analisar e escolher. Avisamos se for escolhido.",
        });
        router.refresh();
      } catch (e) {
        toast({
          title: "Não foi possível candidatar",
          description: (e as Error).message,
          variant: "destructive",
        });
      }
    });
  }

  function withdraw() {
    start(async () => {
      try {
        await withdrawApplication(booking.id);
        setOpen(false);
        toast({ title: "Candidatura retirada" });
        router.refresh();
      } catch (e) {
        toast({
          title: "Erro",
          description: (e as Error).message,
          variant: "destructive",
        });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={size} variant={hasApplied ? "outline" : "default"}>
          {hasApplied ? (
            <>
              <CheckCircle2 className="mr-1 h-4 w-4 text-success" /> Candidatura
              enviada
            </>
          ) : (
            <>
              <Send className="mr-1 h-4 w-4" /> Candidatar-me
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{booking.serviceName}</DialogTitle>
          <DialogDescription>
            Reveja os detalhes e candidate-se. O cliente compara as candidaturas
            e escolhe. Os dados de contacto só ficam disponíveis se for
            escolhido.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <DetailRow icon={Wallet} label="Preço de referência">
            <span className="font-semibold text-primary">
              {priceLabel(booking.estimatedPrice, booking.priceType)}
            </span>
          </DetailRow>
          <DetailRow icon={MapPin} label="Zona">
            {booking.municipality}, {booking.district}
          </DetailRow>
          <DetailRow icon={Clock} label="Data preferida">
            {booking.scheduledStart
              ? formatDateTime(booking.scheduledStart)
              : "A combinar"}
          </DetailRow>
          <DetailRow icon={Timer} label="Duração estimada">
            {durationLabel(booking.durationMinutes)}
          </DetailRow>
          <DetailRow icon={AlertCircle} label="Urgência">
            {URGENCY_LABEL[booking.urgency]}
          </DetailRow>
          <DetailRow icon={Home} label="Tipo de imóvel">
            {PROPERTY_TYPE_LABEL[booking.propertyType]}
          </DetailRow>
          {booking.photoCount ? (
            <DetailRow icon={Camera} label="Fotos">
              {booking.photoCount} anexada{booking.photoCount > 1 ? "s" : ""}
            </DetailRow>
          ) : null}
          {booking.applicantCount ? (
            <DetailRow icon={Users} label="Candidatos">
              {booking.applicantCount}
            </DetailRow>
          ) : null}
          <div className="font-mono text-xs text-muted-foreground">
            {booking.reference}
          </div>
        </div>

        <div className="rounded-lg border bg-muted/40 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Descrição do cliente
          </p>
          <p className="mt-1 whitespace-pre-line text-sm">
            {booking.description}
          </p>
        </div>

        {hasApplied ? (
          <div className="rounded-lg border border-success/30 bg-success/10 p-3 text-sm">
            <p className="font-medium">Já se candidatou a este pedido.</p>
            <p className="text-muted-foreground">
              Aguarde a decisão do cliente. Pode retirar ou atualizar a sua
              candidatura.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Mensagem ao cliente (opcional)</Label>
              <Textarea
                placeholder="Ex.: Tenho disponibilidade esta semana e experiência neste tipo de trabalho."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Proposta de preço € (opcional)</Label>
              <Input
                type="number"
                inputMode="numeric"
                placeholder={
                  booking.estimatedPrice
                    ? String(booking.estimatedPrice)
                    : "Ex.: 40"
                }
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Se indicar um valor, o cliente vê-o na sua candidatura.
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          {hasApplied ? (
            <>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={pending}
              >
                Fechar
              </Button>
              <Button
                variant="outline"
                className="text-destructive hover:bg-destructive/10"
                onClick={withdraw}
                disabled={pending}
              >
                {pending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                Retirar candidatura
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={pending}
              >
                Cancelar
              </Button>
              <Button onClick={submit} disabled={pending}>
                {pending ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-1 h-4 w-4" />
                )}
                Enviar candidatura
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4 shrink-0" /> {label}
      </span>
      <span className="text-right font-medium">{children}</span>
    </div>
  );
}
