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
