import type { Booking } from "@prisma/client";
import { URGENCY_LABEL } from "@/lib/format";
import { absoluteUrl } from "@/lib/site";

// Public, anonymized page for an "open request" — safe to share externally.
export function openRequestPath(reference: string): string {
  return `/pedidos-abertos/${reference}`;
}

// Anonymized caption (no name/address/phone/email) to paste into a Facebook
// group. Facebook's sharer ignores custom text, so we also expose this so the
// admin can copy it alongside the shared link.
export function buildShareCaption(
  booking: Pick<
    Booking,
    "reference" | "municipality" | "district" | "urgency"
  > & {
    serviceName: string;
  }
): string {
  const urg =
    booking.urgency !== "NORMAL" ? ` (${URGENCY_LABEL[booking.urgency]})` : "";
  return [
    `🔧 Novo pedido ao Vizinho`,
    `${booking.serviceName} em ${booking.municipality}${urg}`,
    `Procura-se profissional na zona. Vê os detalhes e aceita aqui 👇`,
    absoluteUrl(openRequestPath(booking.reference)),
  ].join("\n");
}

// Facebook share-dialog URL (works with groups — the admin picks the group and
// posts). The preview comes from the target page's Open Graph tags.
export function facebookShareUrl(reference: string): string {
  const u = encodeURIComponent(absoluteUrl(openRequestPath(reference)));
  return `https://www.facebook.com/sharer/sharer.php?u=${u}`;
}

// Statuses where the request is still open to be picked up.
export function isOpenRequest(status: Booking["status"]): boolean {
  return status === "PENDING";
}
