import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// El registro público (auth.controller.ts) solo permite crear cuentas
// ORGANIZER/ATTENDEE a propósito: la única forma de tener un ADMIN es este
// seed (idempotente: correrlo de nuevo no duplica ni rompe nada), o que un
// ADMIN existente ascienda a otro usuario desde el panel de administración.
async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@eventos.local";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const name = process.env.ADMIN_NAME || "Administrador";

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN" },
    create: { name, email, passwordHash, role: "ADMIN" },
  });

  console.log(`✔ Cuenta admin lista: ${admin.email} (rol ${admin.role})`);
  if (!process.env.ADMIN_PASSWORD) {
    console.log(`  Contraseña por defecto: "${password}" — cámbiala en producción (ADMIN_PASSWORD en .env).`);
  }

  // Organización + organizador + evento de muestra, para que la landing
  // pública y el listado no arranquen vacíos en un ambiente recién creado.
  const demoOrgName = "Comunidad DevTucumán";
  let organization = await prisma.organization.findFirst({ where: { name: demoOrgName } });
  if (!organization) {
    organization = await prisma.organization.create({
      data: { name: demoOrgName, description: "Meetups y talleres de tecnología en Tucumán." },
    });
  }

  const organizerEmail = "organizador@eventos.local";
  const organizer = await prisma.user.upsert({
    where: { email: organizerEmail },
    update: { organizationId: organization.id, role: "ORGANIZER" },
    create: {
      name: "Organizador Demo",
      email: organizerEmail,
      passwordHash: await bcrypt.hash("organizador123", 10),
      role: "ORGANIZER",
      organizationId: organization.id,
    },
  });
  console.log(`✔ Organización lista: "${organization.name}" (organizador: ${organizer.email} / "organizador123")`);

  const demoEventTitle = "Meetup de TypeScript";
  const existingEvent = await prisma.event.findFirst({ where: { title: demoEventTitle, organizationId: organization.id } });
  if (!existingEvent) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 14);
    startDate.setHours(18, 30, 0, 0);
    const endDate = new Date(startDate);
    endDate.setHours(21, 0, 0, 0);

    await prisma.event.create({
      data: {
        title: demoEventTitle,
        description: "Charlas sobre TypeScript avanzado, tipos condicionales y patrones reales de producción.",
        location: "Auditorio Central, San Miguel de Tucumán",
        startDate,
        endDate,
        capacity: 60,
        organizationId: organization.id,
      },
    });
    console.log(`✔ Evento de muestra creado: "${demoEventTitle}"`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
