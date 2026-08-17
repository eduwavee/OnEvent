import { api } from "./client";
import type { Event } from "../types";

export interface EventInput {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  capacity: number;
}

export function listEvents(mine = false) {
  return api.get<{ events: Event[] }>("/events", { params: mine ? { mine: "true" } : {} }).then((r) => r.data.events);
}

export function getEvent(id: string) {
  return api.get<{ event: Event }>(`/events/${id}`).then((r) => r.data.event);
}

export function createEvent(data: EventInput) {
  return api.post<{ event: Event }>("/events", data).then((r) => r.data.event);
}

export function updateEvent(id: string, data: Partial<EventInput>) {
  return api.put<{ event: Event }>(`/events/${id}`, data).then((r) => r.data.event);
}

export function deleteEvent(id: string) {
  return api.delete(`/events/${id}`);
}
