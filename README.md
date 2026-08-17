# Sistema de Gestión de Eventos

Web app full-stack para crear eventos, gestionar inscripciones con control de cupo,
emitir tickets con QR y registrar la asistencia el día del evento (QR o lista manual).

## Stack

- **Backend**: Node.js + Express + TypeScript + Prisma + PostgreSQL
- **Frontend**: React + TypeScript + Vite
- **Auth**: JWT + bcrypt, con roles `ADMIN` / `ORGANIZER` / `ATTENDEE`

## Requisitos

- Node.js 18+
- Docker (para levantar PostgreSQL fácilmente) — o un PostgreSQL propio

## Puesta en marcha

```bash
# 1. Instalar dependencias (raíz + workspaces server/client)
npm install

# 2. Levantar la base de datos
npm run db:up

# 3. Configurar variables de entorno del backend
cp server/.env.example server/.env

# 4. Crear las tablas
npm run prisma:migrate

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

## Estructura

```
server/   API REST (Express + Prisma)
client/   Frontend (React + Vite)
```

Ver `server/README.md` y `client/README.md` (si existen) para detalles específicos de cada parte.
