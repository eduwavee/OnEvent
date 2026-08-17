import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { HttpError } from "../middleware/error.middleware";
import { assertCanManageEvent } from "../utils/permissions";

const baseEventSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().min(1, "La descripción es obligatoria"),
  location: z.string().min(1, "La ubicación es obligatoria"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  capacity: z.coerce.number().int().positive("La capacidad debe ser mayor a 0"),
});

const eventSchema = baseEventSchema.refine((data) => data.endDate > data.startDate, {
  message: "La fecha de fin debe ser posterior a la fecha de inicio",
  path: ["endDate"],
});

const eventUpdateSchema = baseEventSchema.partial().refine(
  (data) => !data.startDate || !data.endDate || data.endDate > data.startDate,
  { message: "La fecha de fin debe ser posterior a la fecha de inicio", path: ["endDate"] }
);

const withOrganization = {
  organization: { select: { id: true, name: true, description: true } },
  _count: { select: { registrations: { where: { status: "CONFIRMED" } } } },
} as const;

async function findEventOrThrow(id: string) {
  const event = await prisma.event.findUnique({ where: { id }, include: withOrganization });
  if (!event) throw new HttpError(404, "Evento no encontrado");
  return event;
}

export async function listEvents(req: Request, res: Response) {
  const mine = req.query.mine === "true";

  const where = mine && req.user?.organizationId ? { organizationId: req.user.organizationId } : mine ? { id: "" } : {};

  const events = await prisma.event.findMany({
    where,
    orderBy: { startDate: "asc" },
    include: withOrganization,
  });

  res.json({ events });
}

export async function getEvent(req: Request, res: Response) {
  const event = await findEventOrThrow(req.params.id);
  res.json({ event });
}

export async function createEvent(req: Request, res: Response) {
  const data = eventSchema.parse(req.body);

  if (!req.user!.organizationId) {
    throw new HttpError(400, "Tu cuenta no tiene una organización asociada");
  }

  const event = await prisma.event.create({
    data: { ...data, organizationId: req.user!.organizationId },
  });
  res.status(201).json({ event });
}

export async function updateEvent(req: Request, res: Response) {
  const existing = await findEventOrThrow(req.params.id);
  assertCanManageEvent(req, existing.organizationId);

  const data = eventUpdateSchema.parse(req.body);
  const event = await prisma.event.update({ where: { id: existing.id }, data });
  res.json({ event });
}

export async function deleteEvent(req: Request, res: Response) {
  const existing = await findEventOrThrow(req.params.id);
  assertCanManageEvent(req, existing.organizationId);

  await prisma.event.delete({ where: { id: existing.id } });
  res.status(204).send();
}
