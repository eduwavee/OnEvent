import { api } from "./client";

export interface PublicStats {
  organizations: number;
  events: number;
  attendance: number;
}

export function getPublicStats() {
  return api.get<PublicStats>("/stats").then((r) => r.data);
}
