import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

/** GET /api/stats — metricas publicas agregadas, para la landing (sin datos sensibles). */
export async function getPublicStats(_req: Request, res: Response) {
  const [organizations, events, attendance] = await Promise.all([
    prisma.organization.count(),
    prisma.event.count(),
    prisma.attendance.count(),
  ]);

  res.json({ organizations, events, attendance });
}
