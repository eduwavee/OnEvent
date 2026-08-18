import { api } from "./client";
import type { Registration } from "../types";

export function registerToEvent(eventId: string) {
  return api.post<{ registration: Registration }>(`/events/${eventId}/registrations`).then((r) => r.data.registration);
}

export function cancelMyRegistration(eventId: string) {
  return api.delete(`/events/${eventId}/registrations/me`);
}

export function getMyTicket(eventId: string) {
  return api
    .get<{ registration: Registration; qrDataUrl: string | null }>(`/events/${eventId}/registrations/me/ticket`)
    .then((r) => r.data);
}

export function listEventRegistrations(eventId: string) {
  return api.get<{ registrations: Registration[] }>(`/events/${eventId}/registrations`).then((r) => r.data.registrations);
}

export function listMyRegistrations() {
  return api.get<{ registrations: Registration[] }>("/registrations/me").then((r) => r.data.registrations);
}
