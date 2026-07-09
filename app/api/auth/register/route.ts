import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { slugify } from "@/lib/utils";

const registerSchema = z.object({
  name: z.string().min(2, "Indique o seu nome"),
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(8, "A palavra-passe deve ter pelo menos 8 caracteres"),
  phone: z.string().min(9, "Telefone inválido").optional().or(z.literal("")),
  role: z.enum(["CLIENT", "PROFESSIONAL"]).default("CLIENT"),
});

async function uniqueProfessionalSlug(base: string): Promise<string> {
  const root = slugify(base) || "profissional";
  let slug = root;
  let n = 1;
  // Try suffixes until free.
  while (await prisma.professionalProfile.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${root}-${n}`;
  }
  return slug;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Validação falhou",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, password, phone, role } = result.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: "Já existe uma conta com este email" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        passwordHash,
        role,
        ...(role === "CLIENT"
          ? { clientProfile: { create: { phone: phone || null } } }
          : {
              professionalProfile: {
                create: {
                  slug: await uniqueProfessionalSlug(name),
                  displayName: name,
                  phone: phone || null,
                  approvalStatus: "PENDING",
                  onboardingStep: 2,
                },
              },
            }),
      },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
