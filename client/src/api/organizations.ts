import { api } from "./client";
import type { Event, Organization } from "../types";

export function getOrganization(id: string) {
  return api
    .get<{ organization: Organization & { createdAt: string }; events: Event[] }>(`/organizations/${id}`)
    .then((r) => r.data);
}

export interface EventStat {
  eventId: string;
  title: string;
  capacity: number;
  registered: number;
  attended: number;
}

export function getMyOrganizationEventStats() {
  return api.get<{ stats: EventStat[] }>("/organizations/me/events-stats").then((r) => r.data.stats);
}
