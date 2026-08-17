import type { NextFunction, Request, Response } from "express";
import type { Role } from "@prisma/client";
import { HttpError } from "./error.middleware";

/** Debe usarse después de requireAuth. Permite el acceso solo a los roles indicados. */
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new HttpError(401, "No autenticado");
    }
    if (!roles.includes(req.user.role)) {
      throw new HttpError(403, "No tienes permisos para realizar esta acción");
    }
    next();
  };
}
