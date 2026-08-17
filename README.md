# Sistema de Gestión de Eventos

Web app full-stack para crear eventos, gestionar inscripciones con control de cupo,
emitir tickets con QR y registrar la asistencia el día del evento (QR o lista manual).

## Stack

- **Backend**: Node.js + Express + TypeScript + Prisma + SQLite
- **Frontend**: React + TypeScript + Vite
- **Auth**: JWT + bcrypt, con roles `ADMIN` / `ORGANIZER` / `ATTENDEE`

SQLite guarda la base de datos como un archivo local (`server/prisma/dev.db`),
así que no hace falta instalar ni levantar ningún servidor de base de datos.

## Requisitos

- Node.js 18+

## Puesta en marcha

```bash
# 1. Instalar dependencias (raíz + workspaces server/client)
npm install

# 2. Configurar variables de entorno del backend
cp server/.env.example server/.env

# 3. Crear la base de datos y las tablas (genera server/prisma/dev.db)
npm run prisma:migrate

# 4. Crear la cuenta de administrador inicial (admin@eventos.local / admin123
#    por defecto — cambialo con ADMIN_EMAIL/ADMIN_PASSWORD en server/.env)
npm run prisma:seed

# 5. Arrancar backend (puerto 4000) y frontend (puerto 5173) juntos
npm run dev
```

Frontend: http://localhost:5173
Backend:  http://localhost:4000/api

## Flujo de uso

1. Registrarse como usuario (rol `ORGANIZER` para poder crear eventos).
2. Crear un evento desde el dashboard de organizador.
3. Con otro usuario (rol `ATTENDEE`), inscribirse al evento — se genera un ticket con QR.
4. El día del evento, el organizador entra a "Check-in" del evento y marca asistencia
   escaneando el QR con la cámara, o manualmente desde la lista de inscritos.
5. Con la cuenta admin (creada por el seed), entrar a "Panel admin" para ver
   estadísticas globales y gestionar el rol o eliminar cualquier usuario. No
   existe un registro público de administradores por seguridad: la única forma
   de crear uno es el seed, o que otro admin ascienda a un usuario existente.

## Estructura

```
server/   API REST (Express + Prisma)
client/   Frontend (React + Vite)
```

Ver `server/README.md` y `client/README.md` (si existen) para detalles específicos de cada parte.
