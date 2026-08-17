import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { HttpError } from "../middleware/error.middleware";

const roleUpdateSchema = z.object({
  role: z.enum(["ADMIN", "ORGANIZER", "ATTENDEE"]),
});

const userAdminSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  organization: { select: { id: true, name: true, _count: { select: { events: true } } } },
  _count: { select: { registrations: true } },
} as const;

/** GET /api/admin/users — lista todos los usuarios (solo ADMIN). */
export async function listUsers(_req: Request, res: Response) {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: userAdminSelect,
  });
  res.json({ users });
}

/** PATCH /api/admin/users/:id/role — cambia el rol de un usuario (solo ADMIN). */
export async function updateUserRole(req: Request, res: Response) {
  const { id } = req.params;
  const { role } = roleUpdateSchema.parse(req.body);

  if (id === req.user!.id) {
    throw new HttpError(400, "No puedes cambiar tu propio rol");
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new HttpError(404, "Usuario no encontrado");

  const user = await prisma.user.update({
    where: { id },
    data: { role },
    select: userAdminSelect,
  });
  res.json({ user });
}

/** DELETE /api/admin/users/:id — elimina un usuario (solo ADMIN). */
export async function deleteUser(req: Request, res: Response) {
  const { id } = req.params;

  if (id === req.user!.id) {
    throw new HttpError(400, "No puedes eliminar tu propia cuenta");
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new HttpError(404, "Usuario no encontrado");

  await prisma.user.delete({ where: { id } });
  res.status(204).send();
}

/** GET /api/admin/stats — metricas globales del sistema (solo ADMIN). */
export async function getGlobalStats(_req: Request, res: Response) {
  const [users, events, registrations, attendance] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.registration.count({ where: { status: "CONFIRMED" } }),
    prisma.attendance.count(),
  ]);

  res.json({ users, events, registrations, attendance });
}
