import { api } from "./client";
import type { Role } from "../types";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  organization: { id: string; name: string; _count: { events: number } } | null;
  _count: { registrations: number };
}

export interface GlobalStats {
  users: number;
  events: number;
  registrations: number;
  attendance: number;
}

export function listUsers() {
  return api.get<{ users: AdminUser[] }>("/admin/users").then((r) => r.data.users);
}

export function updateUserRole(id: string, role: Role) {
  return api.patch<{ user: AdminUser }>(`/admin/users/${id}/role`, { role }).then((r) => r.data.user);
}

export function deleteUser(id: string) {
  return api.delete(`/admin/users/${id}`);
}

export function getGlobalStats() {
  return api.get<GlobalStats>("/admin/stats").then((r) => r.data);
}
