import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { HttpError } from "../middleware/error.middleware";

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

async function findEventOrThrow(id: string) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      organizer: { select: { id: true, name: true, email: true } },
      _count: { select: { registrations: { where: { status: "CONFIRMED" } } } },
    },
  });
  if (!event) throw new HttpError(404, "Evento no encontrado");
  return event;
}

function assertCanManage(req: Request, organizerId: string) {
  const user = req.user!;
  if (user.role !== "ADMIN" && user.id !== organizerId) {
    throw new HttpError(403, "No puedes modificar un evento que no es tuyo");
  }
}

export async function listEvents(req: Request, res: Response) {
  const mine = req.query.mine === "true";

  const where = mine && req.user ? { organizerId: req.user.id } : {};

  const events = await prisma.event.findMany({
    where,
    orderBy: { startDate: "asc" },
    include: {
      organizer: { select: { id: true, name: true, email: true } },
      _count: { select: { registrations: { where: { status: "CONFIRMED" } } } },
    },
  });

  res.json({ events });
}

export async function getEvent(req: Request, res: Response) {
  const event = await findEventOrThrow(req.params.id);
  res.json({ event });
}

export async function createEvent(req: Request, res: Response) {
  const data = eventSchema.parse(req.body);
  const event = await prisma.event.create({
    data: { ...data, organizerId: req.user!.id },
  });
  res.status(201).json({ event });
}

export async function updateEvent(req: Request, res: Response) {
  const existing = await findEventOrThrow(req.params.id);
  assertCanManage(req, existing.organizerId);

  const data = eventUpdateSchema.parse(req.body);
  const event = await prisma.event.update({ where: { id: existing.id }, data });
  res.json({ event });
}

export async function deleteEvent(req: Request, res: Response) {
  const existing = await findEventOrThrow(req.params.id);
  assertCanManage(req, existing.organizerId);

  await prisma.event.delete({ where: { id: existing.id } });
  res.status(204).send();
}
