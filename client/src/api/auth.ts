import { api } from "./client";
import type { Role, User } from "../types";

export interface AuthResponse {
  token: string;
  user: User;
}

export function login(email: string, password: string) {
  return api.post<AuthResponse>("/auth/login", { email, password }).then((r) => r.data);
}

export function register(name: string, email: string, password: string, role: Role) {
  return api.post<AuthResponse>("/auth/register", { name, email, password, role }).then((r) => r.data);
}

export function fetchMe() {
  return api.get<{ user: User }>("/auth/me").then((r) => r.data.user);
}
