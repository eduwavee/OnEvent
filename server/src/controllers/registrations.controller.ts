import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { HttpError } from "../middleware/error.middleware";
import { generateQrDataUrl } from "../utils/qrcode";
import { sendNotification } from "../utils/mailer";

function assertCanManageEvent(req: Request, organizerId: string) {
  const user = req.user!;
  if (user.role !== "ADMIN" && user.id !== organizerId) {
    throw new HttpError(403, "No puedes gestionar inscripciones de un evento que no es tuyo");
  }
}

/** POST /api/events/:eventId/registrations — el usuario autenticado se inscribe al evento. */
export async function registerToEvent(req: Request, res: Response) {
  const { eventId } = req.params;
  const userId = req.user!.id;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { _count: { select: { registrations: { where: { status: "CONFIRMED" } } } } },
  });
  if (!event) throw new HttpError(404, "Evento no encontrado");

  const existing = await prisma.registration.findUnique({
    where: { eventId_userId: { eventId, userId } },
  });
  if (existing && existing.status === "CONFIRMED") {
    throw new HttpError(409, "Ya estás inscrito en este evento");
  }

  if (event._count.registrations >= event.capacity) {
    throw new HttpError(409, "El evento ya alcanzó su capacidad máxima");
  }

  const registration = existing
    ? await prisma.registration.update({
        where: { id: existing.id },
        data: { status: "CONFIRMED" },
      })
    : await prisma.registration.create({ data: { eventId, userId } });

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  await sendNotification(
    user.email,
    `Inscripción confirmada: ${event.title}`,
    `Hola ${user.name}, tu inscripción a "${event.title}" quedó confirmada. Presenta tu ticket QR el día del evento.`
  );

  res.status(201).json({ registration });
}

/** DELETE /api/events/:eventId/registrations/me — el usuario cancela su propia inscripción. */
export async function cancelMyRegistration(req: Request, res: Response) {
  const { eventId } = req.params;
  const userId = req.user!.id;

  const registration = await prisma.registration.findUnique({
    where: { eventId_userId: { eventId, userId } },
  });
  if (!registration || registration.status === "CANCELLED") {
    throw new HttpError(404, "No tienes una inscripción activa en este evento");
  }

  await prisma.registration.update({ where: { id: registration.id }, data: { status: "CANCELLED" } });
  res.status(204).send();
}

/** GET /api/events/:eventId/registrations — lista de inscritos (organizador/admin), para check-in manual. */
export async function listRegistrations(req: Request, res: Response) {
  const { eventId } = req.params;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new HttpError(404, "Evento no encontrado");
  assertCanManageEvent(req, event.organizerId);

  const registrations = await prisma.registration.findMany({
    where: { eventId, status: "CONFIRMED" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      attendance: true,
    },
    orderBy: { registeredAt: "asc" },
  });

  res.json({ registrations });
}

/** GET /api/events/:eventId/registrations/me/ticket — QR del asistente autenticado. */
export async function getMyTicket(req: Request, res: Response) {
  const { eventId } = req.params;
  const userId = req.user!.id;

  const registration = await prisma.registration.findUnique({
    where: { eventId_userId: { eventId, userId } },
    include: { event: true, attendance: true },
  });
  if (!registration || registration.status === "CANCELLED") {
    throw new HttpError(404, "No tienes una inscripción activa en este evento");
  }

  const qrDataUrl = await generateQrDataUrl(registration.qrToken);
  res.json({ registration, qrDataUrl });
}

/** GET /api/registrations/me — todas las inscripciones activas del usuario autenticado. */
export async function listMyRegistrations(req: Request, res: Response) {
  const registrations = await prisma.registration.findMany({
    where: { userId: req.user!.id, status: "CONFIRMED" },
    include: { event: true, attendance: true },
    orderBy: { registeredAt: "desc" },
  });
  res.json({ registrations });
}
