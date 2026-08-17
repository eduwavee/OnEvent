import { api } from "./client";

export interface AttendanceStats {
  registered: number;
  attended: number;
  capacity: number;
}

export function checkIn(eventId: string, payload: { qrToken?: string; registrationId?: string }) {
  return api.post(`/events/${eventId}/attendance/check-in`, payload).then((r) => r.data);
}

export function getAttendanceStats(eventId: string) {
  return api.get<AttendanceStats>(`/events/${eventId}/attendance`).then((r) => r.data);
}
