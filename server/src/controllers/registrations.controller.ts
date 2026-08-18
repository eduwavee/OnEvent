import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { HttpError } from "../middleware/error.middleware";
import { generateQrDataUrl } from "../utils/qrcode";
import { sendNotification } from "../utils/mailer";
import { assertCanManageEvent } from "../utils/permissions";

/**
 * POST /api/events/:eventId/registrations — el usuario autenticado se inscribe al evento.
 * Si ya no hay cupo, queda en lista de espera (status WAITLISTED) en vez de rechazarse.
 */
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
  if (existing && existing.status !== "CANCELLED") {
    throw new HttpError(
      409,
      existing.status === "WAITLISTED" ? "Ya estás en la lista de espera de este evento" : "Ya estás inscrito en este evento"
    );
  }

  const status = event._count.registrations >= event.capacity ? "WAITLISTED" : "CONFIRMED";

  const registration = existing
    ? await prisma.registration.update({ where: { id: existing.id }, data: { status } })
    : await prisma.registration.create({ data: { eventId, userId, status } });

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (status === "CONFIRMED") {
    await sendNotification(
      user.email,
      `Inscripción confirmada: ${event.title}`,
      `Hola ${user.name}, tu inscripción a "${event.title}" quedó confirmada. Presenta tu ticket QR el día del evento.`
    );
  } else {
    await sendNotification(
      user.email,
      `Lista de espera: ${event.title}`,
      `Hola ${user.name}, "${event.title}" alcanzó su capacidad máxima. Quedaste en la lista de espera y te avisaremos si se libera un cupo.`
    );
  }

  res.status(201).json({ registration });
}

/**
 * DELETE /api/events/:eventId/registrations/me — el usuario cancela su propia inscripción.
 * Si liberaba un cupo confirmado, promueve automáticamente al primero en la lista de espera.
 */
export async function cancelMyRegistration(req: Request, res: Response) {
  const { eventId } = req.params;
  const userId = req.user!.id;

  const registration = await prisma.registration.findUnique({
    where: { eventId_userId: { eventId, userId } },
  });
  if (!registration || registration.status === "CANCELLED") {
    throw new HttpError(404, "No tienes una inscripción activa en este evento");
  }

  const freedUpASpot = registration.status === "CONFIRMED";
  await prisma.registration.update({ where: { id: registration.id }, data: { status: "CANCELLED" } });

  if (freedUpASpot) {
    const nextInLine = await prisma.registration.findFirst({
      where: { eventId, status: "WAITLISTED" },
      orderBy: { registeredAt: "asc" },
    });

    if (nextInLine) {
      await prisma.registration.update({ where: { id: nextInLine.id }, data: { status: "CONFIRMED" } });
      const [event, promotedUser] = await Promise.all([
        prisma.event.findUniqueOrThrow({ where: { id: eventId } }),
        prisma.user.findUniqueOrThrow({ where: { id: nextInLine.userId } }),
      ]);
      await sendNotification(
        promotedUser.email,
        `¡Se liberó un cupo!: ${event.title}`,
        `Hola ${promotedUser.name}, se liberó un cupo en "${event.title}" y tu inscripción quedó confirmada. Ya podés ver tu ticket con QR.`
      );
    }
  }

  res.status(204).send();
}

/** GET /api/events/:eventId/registrations — lista de inscritos confirmados (organizador/admin), para check-in manual. */
export async function listRegistrations(req: Request, res: Response) {
  const { eventId } = req.params;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new HttpError(404, "Evento no encontrado");
  assertCanManageEvent(req, event.organizationId);

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

/** GET /api/events/:eventId/registrations/me/ticket — QR del asistente autenticado (null si está en lista de espera). */
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

  const qrDataUrl = registration.status === "CONFIRMED" ? await generateQrDataUrl(registration.qrToken) : null;
  res.json({ registration, qrDataUrl });
}

/** GET /api/registrations/me — inscripciones activas (confirmadas o en espera) del usuario autenticado. */
export async function listMyRegistrations(req: Request, res: Response) {
  const registrations = await prisma.registration.findMany({
    where: { userId: req.user!.id, status: { in: ["CONFIRMED", "WAITLISTED"] } },
    include: { event: true, attendance: true },
    orderBy: { registeredAt: "desc" },
  });
  res.json({ registrations });
}
