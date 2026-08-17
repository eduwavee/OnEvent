import type { NextFunction, Request, Response } from "express";
import type { Role } from "../types";
import { verifyToken } from "../utils/jwt";
import { HttpError } from "./error.middleware";

export interface AuthUser {
  id: string;
  role: Role;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    throw new HttpError(401, "No autenticado");
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    throw new HttpError(401, "Token inválido o expirado");
  }
}
