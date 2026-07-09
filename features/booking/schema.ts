import { z } from "zod";

export const bookingSchema = z.object({
  serviceSlug: z.string().min(1),

  // Location
  address: z.string().min(3, "Indique a morada"),
  postalCode: z
    .string()
    .regex(/^\d{4}-\d{3}$/, "Código postal no formato 0000-000"),
  city: z.string().min(1, "Indique a localidade"),
  municipality: z.string().min(1, "Selecione o concelho"),
  district: z.string().min(1, "Selecione o distrito"),
  accessNotes: z.string().max(500).optional().or(z.literal("")),

  // Details
  clientDescription: z
    .string()
    .min(10, "Descreva o que precisa (mín. 10 caracteres)"),
  urgency: z.enum(["NORMAL", "URGENT", "TODAY"]),
  propertyType: z.enum(["APARTMENT", "HOUSE", "SHOP", "OFFICE", "OTHER"]),
  photoUrls: z.array(z.string()).max(6).optional(),

  // Schedule & assignment
  assignmentMode: z
    .enum(["FIRST_AVAILABLE", "CHOOSE"])
    .default("FIRST_AVAILABLE"),
  professionalId: z.string().optional(),
  scheduledStartISO: z.string().optional(),

  // Contact
  clientName: z.string().min(2, "Indique o seu nome"),
  clientEmail: z.string().email("Email inválido"),
  clientPhone: z.string().min(9, "Telefone inválido"),
  whatsappConsent: z.boolean().default(false),
});

export type BookingInput = z.infer<typeof bookingSchema>;
