import { api } from "./client";
import type { Role, User } from "../types";

export interface AuthResponse {
  token: string;
  user: User;
}

export function login(email: string, password: string) {
  return api.post<AuthResponse>("/auth/login", { email, password }).then((r) => r.data);
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: Role;
  organizationName?: string;
  organizationDescription?: string;
}

export function register(input: RegisterInput) {
  return api.post<AuthResponse>("/auth/register", input).then((r) => r.data);
}

export function fetchMe() {
  return api.get<{ user: User }>("/auth/me").then((r) => r.data.user);
}
