import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { signToken } from "../utils/jwt";
import { HttpError } from "../middleware/error.middleware";
import type { Role } from "../types";

const SALT_ROUNDS = 10;

const registerSchema = z
  .object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    role: z.enum(["ORGANIZER", "ATTENDEE"]).default("ATTENDEE"),
    organizationName: z.string().trim().min(2, "El nombre de la organización debe tener al menos 2 caracteres").optional(),
    organizationDescription: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    // Los eventos cuelgan de una Organización, no de un usuario suelto: todo
    // ORGANIZER debe crear (o, más adelante, unirse a) una al registrarse.
    if (data.role === "ORGANIZER" && !data.organizationName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El nombre de la organización es obligatorio para cuentas de organizador",
        path: ["organizationName"],
      });
    }
  });

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

const updateProfileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Ingresá tu contraseña actual"),
  newPassword: z.string().min(6, "La contraseña nueva debe tener al menos 6 caracteres"),
});

type UserWithOrg = {
  id: string;
  name: string;
  email: string;
  role: string;
  organizationId: string | null;
  organization: { id: string; name: string } | null;
};

function toPublicUser(user: UserWithOrg) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
    organization: user.organization,
  };
}

const withOrganization = {
  organization: { select: { id: true, name: true } },
} as const;

export async function register(req: Request, res: Response) {
  const data = registerSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new HttpError(409, "Ya existe una cuenta con ese email");
  }

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = await prisma.$transaction(async (tx) => {
    let organizationId: string | undefined;

    if (data.role === "ORGANIZER") {
      const organization = await tx.organization.create({
        data: { name: data.organizationName!, description: data.organizationDescription || null },
      });
      organizationId = organization.id;
    }

    return tx.user.create({
      data: { name: data.name, email: data.email, passwordHash, role: data.role, organizationId },
      include: withOrganization,
    });
  });

  const token = signToken({ sub: user.id, role: user.role as Role, organizationId: user.organizationId });
  res.status(201).json({ token, user: toPublicUser(user) });
}

export async function login(req: Request, res: Response) {
  const data = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email: data.email }, include: withOrganization });
  if (!user) {
    throw new HttpError(401, "Credenciales inválidas");
  }

  const valid = await bcrypt.compare(data.password, user.passwordHash);
  if (!valid) {
    throw new HttpError(401, "Credenciales inválidas");
  }

  const token = signToken({ sub: user.id, role: user.role as Role, organizationId: user.organizationId });
  res.json({ token, user: toPublicUser(user) });
}

export async function me(req: Request, res: Response) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id }, include: withOrganization });
  res.json({ user: toPublicUser(user) });
}

/** PATCH /api/auth/me — el usuario autenticado actualiza su nombre. */
export async function updateProfile(req: Request, res: Response) {
  const data = updateProfileSchema.parse(req.body);
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { name: data.name },
    include: withOrganization,
  });
  res.json({ user: toPublicUser(user) });
}

/** POST /api/auth/change-password — requiere la contraseña actual para setear una nueva. */
export async function changePassword(req: Request, res: Response) {
  const data = changePasswordSchema.parse(req.body);

  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } });
  const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
  if (!valid) {
    throw new HttpError(401, "La contraseña actual no es correcta");
  }

  const passwordHash = await bcrypt.hash(data.newPassword, SALT_ROUNDS);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  res.status(204).send();
}
