import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

if (!JWT_SECRET) {
  throw new Error("Falta la variable de entorno JWT_SECRET");
}

export interface JwtPayload {
  sub: string;
  role: Role;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET as string) as JwtPayload;
}
