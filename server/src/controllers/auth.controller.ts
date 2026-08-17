import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { signToken } from "../utils/jwt";
import { HttpError } from "../middleware/error.middleware";

const SALT_ROUNDS = 10;

const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(["ORGANIZER", "ATTENDEE"]).default("ATTENDEE"),
});

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

function toPublicUser(user: { id: string; name: string; email: string; role: string }) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function register(req: Request, res: Response) {
  const data = registerSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new HttpError(409, "Ya existe una cuenta con ese email");
  }

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { name: data.name, email: data.email, passwordHash, role: data.role },
  });

  const token = signToken({ sub: user.id, role: user.role });
  res.status(201).json({ token, user: toPublicUser(user) });
}

export async function login(req: Request, res: Response) {
  const data = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) {
    throw new HttpError(401, "Credenciales inválidas");
  }

  const valid = await bcrypt.compare(data.password, user.passwordHash);
  if (!valid) {
    throw new HttpError(401, "Credenciales inválidas");
  }

  const token = signToken({ sub: user.id, role: user.role });
  res.json({ token, user: toPublicUser(user) });
}

export async function me(req: Request, res: Response) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } });
  res.json({ user: toPublicUser(user) });
}
