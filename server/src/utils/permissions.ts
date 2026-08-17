import type { Request } from "express";
import { HttpError } from "../middleware/error.middleware";

/**
 * Un evento (y todo lo que cuelga de él: inscripciones, asistencia) solo lo
 * puede gestionar un miembro de la organización dueña, o un ADMIN.
 */
export function assertCanManageEvent(req: Request, organizationId: string) {
  const user = req.user!;
  if (user.role !== "ADMIN" && user.organizationId !== organizationId) {
    throw new HttpError(403, "No puedes gestionar un evento que no es de tu organización");
  }
}
