import type {
  BookingStatus,
  PriceType,
  Urgency,
  PropertyType,
  ApprovalStatus,
} from "@prisma/client";

// --- Money -------------------------------------------------------------------
export function euros(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export function priceLabel(price: number | null, type: PriceType): string {
  if (type === "QUOTE" || price === null) return "Orçamento sob avaliação";
  if (type === "FIXED") return euros(price);
  if (type === "HOURLY") return `${euros(price)}/hora`;
  return `A partir de ${euros(price)}`;
}

export const PRICE_TYPE_LABEL: Record<PriceType, string> = {
  FIXED: "Preço fixo",
  STARTING: "A partir de",
  HOURLY: "Preço à hora",
  QUOTE: "Orçamento sob avaliação",
};

// --- Duration ----------------------------------------------------------------
export function durationLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = minutes / 60;
  return Number.isInteger(h) ? `${h}h` : `${Math.floor(h)}h${minutes % 60}`;
}

// --- Dates -------------------------------------------------------------------
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatWeekday(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-PT", { weekday: "long" }).format(
    new Date(date)
  );
}

// --- Enum labels -------------------------------------------------------------
export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  DRAFT: "Rascunho",
  PENDING: "Pendente",
  ACCEPTED: "Aceite",
  REJECTED: "Recusado",
  SCHEDULED: "Agendado",
  IN_PROGRESS: "Em curso",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
  RESCHEDULE_REQUESTED: "Reagendamento pedido",
  NO_SHOW: "Não compareceu",
};

// Tailwind classes per status (badge tone)
export const BOOKING_STATUS_TONE: Record<BookingStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  PENDING:
    "bg-warm/15 text-warm-foreground/90 border border-warm/30 text-amber-700",
  ACCEPTED: "bg-primary/10 text-primary border border-primary/20",
  REJECTED: "bg-destructive/10 text-destructive border border-destructive/20",
  SCHEDULED: "bg-primary/10 text-primary border border-primary/20",
  IN_PROGRESS: "bg-primary/10 text-primary border border-primary/20",
  COMPLETED: "bg-success/10 text-success border border-success/20",
  CANCELLED: "bg-muted text-muted-foreground border",
  RESCHEDULE_REQUESTED: "bg-amber-100 text-amber-700 border border-amber-200",
  NO_SHOW: "bg-destructive/10 text-destructive border border-destructive/20",
};

export const URGENCY_LABEL: Record<Urgency, string> = {
  NORMAL: "Normal",
  URGENT: "Urgente",
  TODAY: "Hoje, se possível",
};

export const PROPERTY_TYPE_LABEL: Record<PropertyType, string> = {
  APARTMENT: "Apartamento",
  HOUSE: "Moradia",
  SHOP: "Loja",
  OFFICE: "Escritório",
  OTHER: "Outro",
};

export const APPROVAL_STATUS_LABEL: Record<ApprovalStatus, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  REJECTED: "Recusado",
};

export const WEEKDAYS = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
  "Domingo",
] as const;
