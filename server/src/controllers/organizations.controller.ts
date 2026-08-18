import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { HttpError } from "../middleware/error.middleware";

/** GET /api/organizations/:id — perfil público de una organización y sus eventos. */
export async function getOrganization(req: Request, res: Response) {
  const organization = await prisma.organization.findUnique({
    where: { id: req.params.id },
    select: { id: true, name: true, description: true, createdAt: true },
  });
  if (!organization) throw new HttpError(404, "Organización no encontrada");

  const events = await prisma.event.findMany({
    where: { organizationId: organization.id },
    orderBy: { startDate: "asc" },
    include: {
      organization: { select: { id: true, name: true, description: true } },
      _count: { select: { registrations: { where: { status: "CONFIRMED" } } } },
    },
  });

  res.json({ organization, events });
}

/**
 * GET /api/organizations/me/events-stats — inscriptos confirmados vs. asistencias por cada
 * evento de la organización del usuario autenticado. Para el gráfico de "Mis eventos".
 */
export async function getMyOrganizationEventStats(req: Request, res: Response) {
  const organizationId = req.user!.organizationId;
  if (!organizationId) {
    return res.json({ stats: [] });
  }

  const events = await prisma.event.findMany({
    where: { organizationId },
    orderBy: { startDate: "asc" },
    select: {
      id: true,
      title: true,
      capacity: true,
      _count: { select: { registrations: { where: { status: "CONFIRMED" } } } },
    },
  });

  const eventIds = events.map((e) => e.id);
  const attendances = await prisma.attendance.findMany({
    where: { registration: { eventId: { in: eventIds } } },
    select: { registration: { select: { eventId: true } } },
  });

  const attendedByEvent = new Map<string, number>();
  for (const a of attendances) {
    const id = a.registration.eventId;
    attendedByEvent.set(id, (attendedByEvent.get(id) || 0) + 1);
  }

  const stats = events.map((e) => ({
    eventId: e.id,
    title: e.title,
    capacity: e.capacity,
    registered: e._count.registrations,
    attended: attendedByEvent.get(e.id) || 0,
  }));

  res.json({ stats });
}
