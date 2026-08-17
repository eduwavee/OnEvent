export type Role = "ADMIN" | "ORGANIZER" | "ATTENDEE";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  capacity: number;
  organizerId: string;
  organizer: { id: string; name: string; email: string };
  _count: { registrations: number };
}

export type RegistrationStatus = "CONFIRMED" | "CANCELLED";

export interface Attendance {
  id: string;
  checkedInAt: string;
  checkedById: string;
}

export interface Registration {
  id: string;
  qrToken: string;
  status: RegistrationStatus;
  registeredAt: string;
  eventId: string;
  userId: string;
  event?: Event;
  user?: { id: string; name: string; email: string };
  attendance?: Attendance | null;
}
