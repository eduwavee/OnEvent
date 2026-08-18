export type Role = "ADMIN" | "ORGANIZER" | "ATTENDEE";

export interface Organization {
  id: string;
  name: string;
  description?: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  organizationId: string | null;
  organization: Organization | null;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  imageUrl?: string | null;
  startDate: string;
  endDate: string;
  capacity: number;
  organizationId: string;
  organization: Organization;
  _count: { registrations: number };
}

export type RegistrationStatus = "CONFIRMED" | "WAITLISTED" | "CANCELLED";

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
