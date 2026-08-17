import type { NextFunction, Request, Response } from "express";
import type { Role } from "../types";
import { verifyToken } from "../utils/jwt";
import { HttpError } from "./error.middleware";

export interface AuthUser {
  id: string;
  role: Role;
  organizationId: string | null;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  return header?.startsWith("Bearer ") ? header.slice(7) : null;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);

  if (!token) {
    throw new HttpError(401, "No autenticado");
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, role: payload.role, organizationId: payload.organizationId ?? null };
    next();
  } catch {
    throw new HttpError(401, "Token inválido o expirado");
  }
}

/**
 * Para rutas públicas que igual quieren saber quién pregunta cuando hay
 * sesión (ej. GET /events?mine=true). A diferencia de requireAuth, nunca
 * rechaza la petición: si no hay token o es inválido, sigue sin req.user.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (token) {
    try {
      const payload = verifyToken(token);
      req.user = { id: payload.sub, role: payload.role, organizationId: payload.organizationId ?? null };
    } catch {
      // token invalido/expirado en una ruta publica: se ignora, sigue como anonimo
    }
  }
  next();
}
