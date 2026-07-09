import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@prisma/client";

// Email sending is not wired to a provider yet. These helpers create in-app
// notifications and log the email that *would* be sent, so the flows are
// complete and a provider (Resend/SendGrid) can be dropped in later.
//
// TODO: integrate an email provider. Read credentials from env and replace the
// console.log below with a real send.

interface EmailPayload {
  to: string;
  subject: string;
  body: string;
}

export async function sendEmail({
  to,
  subject,
  body,
}: EmailPayload): Promise<void> {
  // TODO: replace with real provider call.
  console.log(`📧 [email:stub] → ${to} | ${subject}\n${body}\n`);
}

export async function notifyUser(params: {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
}): Promise<void> {
  await prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      link: params.link,
    },
  });
}

// --- Templated events --------------------------------------------------------
export async function notifyBookingCreated(args: {
  professionalUserId?: string | null;
  clientEmail: string;
  reference: string;
  serviceName: string;
}) {
  await sendEmail({
    to: args.clientEmail,
    subject: `Pedido ${args.reference} recebido — Vizinho`,
    body: `Recebemos o seu pedido de "${args.serviceName}". Um profissional irá responder em breve.`,
  });
  if (args.professionalUserId) {
    await notifyUser({
      userId: args.professionalUserId,
      type: "BOOKING_CREATED",
      title: "Novo pedido recebido",
      body: `${args.serviceName} — ref. ${args.reference}`,
      link: "/profissional/pedidos",
    });
  }
}

export async function notifyBookingAccepted(args: {
  clientUserId?: string | null;
  clientEmail: string;
  reference: string;
}) {
  await sendEmail({
    to: args.clientEmail,
    subject: `Pedido ${args.reference} aceite — Vizinho`,
    body: "Boas notícias! Um profissional aceitou o seu pedido.",
  });
  if (args.clientUserId) {
    await notifyUser({
      userId: args.clientUserId,
      type: "BOOKING_ACCEPTED",
      title: "Pedido aceite",
      body: `Ref. ${args.reference}`,
      link: "/dashboard/pedidos",
    });
  }
}

export async function notifyBookingRejected(args: {
  clientUserId?: string | null;
  clientEmail: string;
  reference: string;
}) {
  await sendEmail({
    to: args.clientEmail,
    subject: `Pedido ${args.reference} — atualização`,
    body: "O profissional não pôde aceitar o seu pedido. Vamos procurar outro profissional para si.",
  });
  if (args.clientUserId) {
    await notifyUser({
      userId: args.clientUserId,
      type: "BOOKING_REJECTED",
      title: "Pedido recusado",
      body: `Ref. ${args.reference}`,
      link: "/dashboard/pedidos",
    });
  }
}

export async function notifyBookingCompleted(args: {
  clientUserId?: string | null;
  clientEmail: string;
  reference: string;
}) {
  await sendEmail({
    to: args.clientEmail,
    subject: `Serviço concluído — deixe a sua avaliação`,
    body: "O seu serviço foi concluído. Que tal deixar uma avaliação ao profissional?",
  });
  if (args.clientUserId) {
    await notifyUser({
      userId: args.clientUserId,
      type: "REVIEW_REQUEST",
      title: "Avalie o seu profissional",
      body: `Ref. ${args.reference}`,
      link: "/dashboard/pedidos",
    });
  }
}
