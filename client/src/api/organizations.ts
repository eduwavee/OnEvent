import { api } from "./client";
import type { Event, Organization } from "../types";

export function getOrganization(id: string) {
  return api
    .get<{ organization: Organization & { createdAt: string }; events: Event[] }>(`/organizations/${id}`)
    .then((r) => r.data);
}
