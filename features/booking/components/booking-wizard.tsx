"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Star,
  Clock,
  ShieldCheck,
  Loader2,
  UserCheck,
} from "lucide-react";
import type { PriceType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { ImageUploader } from "@/components/image-uploader";
import { cn } from "@/lib/utils";
import {
  priceLabel,
  durationLabel,
  URGENCY_LABEL,
  PROPERTY_TYPE_LABEL,
} from "@/lib/format";
import { DISTRICTS, getLocationBySlug } from "@/lib/data/locations";
import {
  getAvailability,
  createBooking,
  type AvailabilityResponse,
} from "../actions";
import type { BookingInput } from "../schema";

interface Props {
  service: {
    name: string;
    slug: string;
    categoryName: string;
    categorySlug: string;
    basePrice: number | null;
    priceType: PriceType;
    durationMinutes: number;
    requiresPhotos: boolean;
  };
  initialLocationSlug?: string;
  isLoggedIn?: boolean;
  defaultContact?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  };
}

const STEPS = ["Localização", "Detalhes", "Data e hora", "Contacto", "Resumo"];

export function BookingWizard({
  service,
  initialLocationSlug,
  isLoggedIn = false,
  defaultContact,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const initialLoc = initialLocationSlug
    ? getLocationBySlug(initialLocationSlug)
    : undefined;

  const [form, setForm] = useState<Partial<BookingInput>>({
    serviceSlug: service.slug,
    urgency: "NORMAL",
    propertyType: "APARTMENT",
    assignmentMode: "FIRST_AVAILABLE",
    district: initialLoc?.district.name ?? "",
    municipality: initialLoc?.name ?? "",
    city: initialLoc?.name ?? "",
    clientName: defaultContact?.name ?? "",
    clientEmail: defaultContact?.email ?? "",
    clientPhone: defaultContact?.phone ?? "",
    whatsappConsent: false,
  });

  const set = <K extends keyof BookingInput>(key: K, value: BookingInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const isQuote = service.priceType === "QUOTE";

  // --- Availability loading ---------------------------------------------------
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(
    null
  );
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedProId, setSelectedProId] = useState<string | null>(null);

  useEffect(() => {
    if (step !== 2) return;
    if (!form.district || !form.municipality) return;
    let cancelled = false;
    setLoadingSlots(true);
    getAvailability({
      serviceSlug: service.slug,
      district: form.district,
      municipality: form.municipality,
    })
      .then((res) => {
        if (cancelled) return;
        setAvailability(res);
        setSelectedDay(res.aggregated[0]?.dateISO ?? null);
        // Clear any prior professional selection when the area changes.
        if (res.professionals.length === 0) {
          setSelectedProId(null);
          set("professionalId", undefined);
          set("assignmentMode", "FIRST_AVAILABLE");
        }
      })
      .finally(() => !cancelled && setLoadingSlots(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, form.district, form.municipality]);

  // --- Step validation --------------------------------------------------------
  function canContinue(): boolean {
    if (step === 0) {
      return Boolean(
        form.district &&
        form.municipality &&
        form.address &&
        /^\d{4}-\d{3}$/.test(form.postalCode ?? "")
      );
    }
    if (step === 1) {
      return (form.clientDescription ?? "").trim().length >= 10;
    }
    if (step === 2) {
      return isQuote || Boolean(form.scheduledStartISO);
    }
    if (step === 3) {
      return Boolean(
        form.clientName &&
        /.+@.+\..+/.test(form.clientEmail ?? "") &&
        (form.clientPhone ?? "").length >= 9
      );
    }
    return true;
  }

  async function submit() {
    setSubmitting(true);
    try {
      const res = await createBooking(form as BookingInput);
      if (res.ok && res.reference) {
        router.push(`/pedido/${res.reference}`);
      } else {
        toast({
          title: "Não foi possível criar o pedido",
          description: res.error ?? "Verifique os dados e tente novamente.",
          variant: "destructive",
        });
        setSubmitting(false);
      }
    } catch {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente.",
        variant: "destructive",
      });
      setSubmitting(false);
    }
  }

  const municipalities =
    DISTRICTS.find((d) => d.name === form.district)?.municipalities ?? [];

  // Generic preferred-time slots, used when there are no professionals / no real
  // availability yet. The client still books; the admin assigns a professional.
  const fallbackDays = useMemo(() => buildFallbackDays(14), []);

  const hasRealSlots =
    !!availability && availability.aggregated.some((d) => d.slots.length > 0);
  // Fall back to a generic picker whenever we have a response but no real slots
  // (no professionals in the area yet, or none with free time).
  const usingFallback = !!availability && !hasRealSlots;
  const displayDays = usingFallback
    ? fallbackDays
    : (availability?.aggregated ?? []);

  const effectiveDay =
    selectedDay && displayDays.some((d) => d.dateISO === selectedDay)
      ? selectedDay
      : (displayDays[0]?.dateISO ?? null);
  const currentDay = displayDays.find((d) => d.dateISO === effectiveDay);
  const daySlots = currentDay?.slots.filter(
    (s) =>
      usingFallback ||
      !selectedProId ||
      s.professionalIds.includes(selectedProId)
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        {/* Stepper */}
        <ol className="mb-8 flex items-center gap-2">
          {STEPS.map((label, i) => (
            <li key={label} className="flex flex-1 items-center gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    i < step && "bg-primary text-primary-foreground",
                    i === step &&
                      "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    i > step && "bg-muted text-muted-foreground"
                  )}
                >
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "hidden text-xs font-medium sm:block",
                    i === step ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <span className="h-px flex-1 bg-border" />
              )}
            </li>
          ))}
        </ol>

        {/* Step content */}
        <div className="rounded-2xl border bg-card p-5 sm:p-6">
          {step === 0 && (
            <div className="space-y-4">
              <StepTitle
                title="Onde é o serviço?"
                subtitle="Indique a morada onde o profissional deve ir."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Distrito">
                  <Select
                    value={form.district}
                    onChange={(e) => {
                      set("district", e.target.value);
                      set("municipality", "");
                    }}
                  >
                    <option value="">Selecione o distrito</option>
                    {DISTRICTS.map((d) => (
                      <option key={d.slug} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Concelho">
                  <Select
                    value={form.municipality}
                    onChange={(e) => {
                      set("municipality", e.target.value);
                      if (!form.city) set("city", e.target.value);
                    }}
                    disabled={!form.district}
                  >
                    <option value="">Selecione o concelho</option>
                    {municipalities.map((m) => (
                      <option key={m.slug} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <Field label="Morada">
                <Input
                  placeholder="Rua, número, andar"
                  value={form.address ?? ""}
                  onChange={(e) => set("address", e.target.value)}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Código Postal">
                  <Input
                    placeholder="0000-000"
                    value={form.postalCode ?? ""}
                    onChange={(e) => set("postalCode", e.target.value)}
                  />
                </Field>
                <Field label="Localidade">
                  <Input
                    placeholder="Localidade"
                    value={form.city ?? ""}
                    onChange={(e) => set("city", e.target.value)}
                  />
                </Field>
              </div>
              <Field label="Notas de acesso / estacionamento (opcional)">
                <Textarea
                  placeholder="Ex.: portão azul, estacionamento na rua, tocar à campainha 2..."
                  value={form.accessNotes ?? ""}
                  onChange={(e) => set("accessNotes", e.target.value)}
                />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <StepTitle
                title="O que precisa?"
                subtitle="Descreva o trabalho para o profissional se preparar."
              />
              <Field label="Descrição">
                <Textarea
                  className="min-h-[120px]"
                  placeholder="Ex.: preciso de montar um roupeiro de 2 portas do IKEA e fixá-lo à parede."
                  value={form.clientDescription ?? ""}
                  onChange={(e) => set("clientDescription", e.target.value)}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Urgência">
                  <Select
                    value={form.urgency}
                    onChange={(e) =>
                      set("urgency", e.target.value as BookingInput["urgency"])
                    }
                  >
                    {Object.entries(URGENCY_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Tipo de imóvel">
                  <Select
                    value={form.propertyType}
                    onChange={(e) =>
                      set(
                        "propertyType",
                        e.target.value as BookingInput["propertyType"]
                      )
                    }
                  >
                    {Object.entries(PROPERTY_TYPE_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <Field
                label={`Fotos ${service.requiresPhotos ? "(recomendadas)" : "(opcional)"}`}
              >
                <ImageUploader
                  folder="bookings"
                  multiple
                  max={6}
                  value={form.photoUrls ?? []}
                  onChange={(urls) => set("photoUrls", urls)}
                />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <StepTitle
                title="Quando prefere?"
                subtitle="Escolha um horário disponível de um profissional na sua zona."
              />

              {/* Assignment mode — only when real professionals are available */}
              {!loadingSlots && !usingFallback && availability && (
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      ["FIRST_AVAILABLE", "Primeiro disponível"],
                      ["CHOOSE", "Escolher profissional"],
                    ] as const
                  ).map(([mode, label]) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => {
                        set("assignmentMode", mode);
                        setSelectedProId(null);
                        set("professionalId", undefined);
                      }}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                        form.assignmentMode === mode
                          ? "border-primary bg-primary/5 text-primary"
                          : "hover:bg-muted"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}

              {loadingSlots && (
                <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> A procurar
                  disponibilidade...
                </div>
              )}

              {/* No real availability yet — client still picks a preferred time */}
              {!loadingSlots && usingFallback && (
                <div className="rounded-lg border border-warm/30 bg-warm/10 p-4 text-sm">
                  <p className="font-medium">Escolha o horário que prefere</p>
                  <p className="mt-1 text-muted-foreground">
                    Estamos a alargar a rede de profissionais em{" "}
                    {form.municipality}. Indique o horário que lhe dá jeito e a
                    nossa equipa trata de encontrar um profissional e confirmar
                    consigo.
                  </p>
                </div>
              )}

              {/* Choose professional list */}
              {!loadingSlots &&
                !usingFallback &&
                form.assignmentMode === "CHOOSE" &&
                availability &&
                availability.professionals.length > 0 && (
                  <div className="space-y-2">
                    {availability.professionals.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedProId(p.id);
                          set("professionalId", p.id);
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                          selectedProId === p.id
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted"
                        )}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                          {p.displayName.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {p.displayName}
                          </p>
                          <p className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-0.5">
                              <Star className="h-3 w-3 fill-warm text-warm" />
                              {p.ratingAverage.toFixed(1)} ({p.ratingCount})
                            </span>
                            {p.isVerified && (
                              <span className="flex items-center gap-0.5 text-primary">
                                <ShieldCheck className="h-3 w-3" /> Verificado
                              </span>
                            )}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

              {/* Day + slot picker */}
              {!loadingSlots && displayDays.length > 0 && (
                <div className="space-y-3">
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {displayDays.map((d) => (
                      <button
                        key={d.dateISO}
                        type="button"
                        onClick={() => setSelectedDay(d.dateISO)}
                        className={cn(
                          "shrink-0 rounded-lg border px-3 py-2 text-xs font-medium capitalize",
                          effectiveDay === d.dateISO
                            ? "border-primary bg-primary/5 text-primary"
                            : "hover:bg-muted"
                        )}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {daySlots && daySlots.length > 0 ? (
                      daySlots.map((s) => (
                        <button
                          key={s.startISO}
                          type="button"
                          onClick={() => set("scheduledStartISO", s.startISO)}
                          className={cn(
                            "rounded-lg border py-2 text-sm font-medium",
                            form.scheduledStartISO === s.startISO
                              ? "border-primary bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          )}
                        >
                          {s.label}
                        </button>
                      ))
                    ) : (
                      <p className="col-span-full text-sm text-muted-foreground">
                        Sem horários neste dia. Experimente outro dia.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {isQuote && (
                <label className="flex items-center gap-2 rounded-lg border bg-muted/40 p-3 text-sm">
                  <input
                    type="checkbox"
                    checked={!form.scheduledStartISO}
                    onChange={(e) => {
                      if (e.target.checked) set("scheduledStartISO", undefined);
                    }}
                    className="h-4 w-4"
                  />
                  Este serviço é orçamentado — prefiro ser contactado para
                  combinar o horário.
                </label>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <StepTitle
                title="Os seus contactos"
                subtitle="Para o profissional o poder contactar."
              />
              {isLoggedIn && (
                <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
                  <UserCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    Sessão iniciada como{" "}
                    <strong>{form.clientName || form.clientEmail}</strong>. Os
                    seus dados já estão preenchidos — pode editá-los se este
                    pedido for para outra pessoa.
                  </span>
                </div>
              )}
              <Field label="Nome">
                <Input
                  value={form.clientName ?? ""}
                  onChange={(e) => set("clientName", e.target.value)}
                  placeholder="O seu nome"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email">
                  <Input
                    type="email"
                    value={form.clientEmail ?? ""}
                    onChange={(e) => set("clientEmail", e.target.value)}
                    placeholder="email@exemplo.pt"
                  />
                </Field>
                <Field label="Telefone">
                  <Input
                    value={form.clientPhone ?? ""}
                    onChange={(e) => set("clientPhone", e.target.value)}
                    placeholder="9XX XXX XXX"
                  />
                </Field>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.whatsappConsent ?? false}
                  onChange={(e) => set("whatsappConsent", e.target.checked)}
                  className="h-4 w-4"
                />
                Aceito ser contactado por WhatsApp sobre este pedido.
              </label>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <StepTitle
                title="Resumo do pedido"
                subtitle="Confirme os dados antes de submeter."
              />
              <SummaryRow label="Serviço" value={service.name} />
              <SummaryRow
                label="Preço"
                value={priceLabel(service.basePrice, service.priceType)}
              />
              <SummaryRow
                label="Duração estimada"
                value={durationLabel(service.durationMinutes)}
              />
              <SummaryRow
                label="Local"
                value={`${form.address}, ${form.postalCode} ${form.city} (${form.municipality}, ${form.district})`}
              />
              <SummaryRow
                label="Horário"
                value={
                  form.scheduledStartISO
                    ? new Intl.DateTimeFormat("pt-PT", {
                        dateStyle: "full",
                        timeStyle: "short",
                      }).format(new Date(form.scheduledStartISO))
                    : "A combinar (orçamento)"
                }
              />
              <SummaryRow
                label="Urgência"
                value={
                  URGENCY_LABEL[form.urgency as keyof typeof URGENCY_LABEL]
                }
              />
              <SummaryRow
                label="Descrição"
                value={form.clientDescription ?? ""}
              />
              <SummaryRow
                label="Contacto"
                value={`${form.clientName} · ${form.clientEmail} · ${form.clientPhone}`}
              />
              <p className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                Ao submeter, o pedido fica{" "}
                <strong>pendente de aceitação</strong> por um profissional. Não
                é cobrado nada agora. Os preços podem variar consoante a
                complexidade e os materiais.
              </p>
            </div>
          )}
        </div>

        {/* Nav */}
        <div className="mt-5 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => (step === 0 ? router.back() : setStep((s) => s - 1))}
            disabled={submitting}
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Voltar
          </Button>
          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canContinue()}
            >
              Continuar <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={submit} disabled={submitting} size="lg">
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submeter pedido
            </Button>
          )}
        </div>
      </div>

      {/* Summary aside */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-2xl border bg-card p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {service.categoryName}
          </p>
          <h2 className="mt-1 font-semibold">{service.name}</h2>
          <p className="mt-3 text-2xl font-bold text-primary">
            {priceLabel(service.basePrice, service.priceType)}
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />{" "}
              {durationLabel(service.durationMinutes)}
            </li>
            {form.municipality && (
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> {form.municipality}
              </li>
            )}
          </ul>
          <Link
            href={`/servicos/${service.categorySlug}/${service.slug}`}
            className="mt-4 block text-xs text-primary hover:underline"
          >
            Ver detalhes do serviço
          </Link>
        </div>
      </aside>
    </div>
  );
}

// Generic preferred-time slots for the next `numDays` days (from tomorrow),
// business hours 08:00–18:00. Shaped like the aggregated availability so the
// picker renders identically; `professionalIds` is empty (admin will assign).
function buildFallbackDays(numDays: number) {
  const labelFmt = new Intl.DateTimeFormat("pt-PT", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
  const days: {
    dateISO: string;
    label: string;
    slots: { startISO: string; label: string; professionalIds: string[] }[];
  }[] = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  for (let i = 1; i <= numDays; i++) {
    const date = new Date(base);
    date.setDate(date.getDate() + i);
    const slots = [];
    for (let h = 8; h <= 18; h++) {
      const start = new Date(date);
      start.setHours(h, 0, 0, 0);
      slots.push({
        startISO: start.toISOString(),
        label: `${String(h).padStart(2, "0")}:00`,
        professionalIds: [] as string[],
      });
    }
    days.push({
      dateISO: date.toISOString().slice(0, 10),
      label: labelFmt.format(date),
      slots,
    });
  }
  return days;
}

// --- small presentational helpers -------------------------------------------
function StepTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h1 className="text-xl font-bold">{title}</h1>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b pb-2 sm:flex-row sm:justify-between sm:gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium sm:text-right">{value}</span>
    </div>
  );
}
