// SQLite no soporta enums nativos en Prisma (ver prisma/schema.prisma), así que
// los roles y estados de inscripción se modelan como String en la BD y se
// tipan/validan aquí y con zod en cada controller.

export type Role = "ADMIN" | "ORGANIZER" | "ATTENDEE";

export type RegistrationStatus = "CONFIRMED" | "CANCELLED";
