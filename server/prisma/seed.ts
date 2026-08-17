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
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
