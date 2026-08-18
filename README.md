# Sistema de Gestión de Eventos

Web app full-stack para que **organizaciones** publiquen eventos, gestionen inscripciones
con control de cupo, emitan tickets con QR y registren la asistencia el día del evento
(QR o lista manual). Landing pública para explorar eventos sin necesidad de iniciar sesión.

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

# 4. Crear la cuenta de administrador inicial + datos de muestra
#    (org. "Comunidad DevTucumán" con un organizador y un evento)
#    admin@eventos.local / admin123 — cambialo con ADMIN_EMAIL/ADMIN_PASSWORD
npm run prisma:seed

# 5. Arrancar backend (puerto 4000) y frontend (puerto 5173) juntos
npm run dev
```

Frontend: http://localhost:5173
Backend:  http://localhost:4000/api

## Modelo de datos

Los eventos pertenecen a una **Organización**, no a un usuario suelto. Al registrarse
con el rol "Organización" (`ORGANIZER`), se crea la cuenta y su organización juntas
(nombre + descripción opcional); todo lo que esa cuenta cree queda a nombre de la
organización, no de la persona.

## Flujo de uso

1. Desde la landing (`/`), "Registrar tu organización" crea una cuenta `ORGANIZER` +
   su organización, o registrarse como `ATTENDEE` para solo inscribirse a eventos.
2. Crear un evento desde "Mis eventos" (dashboard de la organización).
3. Con una cuenta `ATTENDEE`, inscribirse al evento desde `/eventos` — se genera un
   ticket con QR.
4. El día del evento, alguien de la organización entra a "Check-in" del evento y marca
   asistencia escaneando el QR con la cámara, o manualmente desde la lista de inscritos
   (con opción de exportar la lista de inscritos a CSV).
5. Si un evento se llena, las siguientes inscripciones quedan en **lista de espera** y se
   promueven automáticamente a confirmadas (con su ticket QR) apenas alguien cancela.
6. Desde el detalle de un evento, cualquiera puede agregarlo a su calendario (descarga un
   `.ics`) o compartir el link.
7. Cualquier usuario puede editar su nombre o cambiar su contraseña desde "Mi perfil".
8. Con la cuenta admin (creada por el seed), entrar a "Panel admin" para ver
   estadísticas globales y gestionar el rol o eliminar cualquier usuario. No
   existe un registro público de administradores por seguridad: la única forma
   de crear uno es el seed, o que otro admin ascienda a un usuario existente.

## Estructura

```
server/   API REST (Express + Prisma)
client/   Frontend (React + Vite)
```

Ver `server/README.md` y `client/README.md` (si existen) para detalles específicos de cada parte.
