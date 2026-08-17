import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { HttpError } from "../middleware/error.middleware";
import { assertCanManageEvent } from "../utils/permissions";

const checkInSchema = z
  .object({
    qrToken: z.string().min(1).optional(),
    registrationId: z.string().min(1).optional(),
  })
  .refine((data) => data.qrToken || data.registrationId, {
    message: "Se requiere qrToken o registrationId",
  });

/** POST /api/events/:eventId/attendance/check-in — marca asistencia vía QR o manualmente. */
export async function checkIn(req: Request, res: Response) {
  const { eventId } = req.params;
  const { qrToken, registrationId } = checkInSchema.parse(req.body);

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new HttpError(404, "Evento no encontrado");
  assertCanManageEvent(req, event.organizationId);

  const registration = await prisma.registration.findFirst({
    where: {
      eventId,
      ...(qrToken ? { qrToken } : { id: registrationId }),
    },
    include: { attendance: true, user: { select: { id: true, name: true, email: true } } },
  });

  if (!registration) {
    throw new HttpError(404, "No se encontró una inscripción con ese código para este evento");
  }
  if (registration.status === "CANCELLED") {
    throw new HttpError(409, "Esta inscripción fue cancelada, no puede registrar asistencia");
  }
  if (registration.attendance) {
    throw new HttpError(409, `${registration.user.name} ya tiene asistencia registrada`);
  }

  const attendance = await prisma.attendance.create({
    data: { registrationId: registration.id, checkedById: req.user!.id },
  });

  res.status(201).json({ attendance, attendee: registration.user });
}

/** GET /api/events/:eventId/attendance — estadísticas de asistencia (inscritos vs. asistieron). */
export async function getAttendanceStats(req: Request, res: Response) {
  const { eventId } = req.params;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new HttpError(404, "Evento no encontrado");
  assertCanManageEvent(req, event.organizationId);

  const [registered, attended] = await Promise.all([
    prisma.registration.count({ where: { eventId, status: "CONFIRMED" } }),
    prisma.attendance.count({ where: { registration: { eventId } } }),
  ]);

  res.json({ registered, attended, capacity: event.capacity });
}
