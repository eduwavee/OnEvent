import type { Event } from "../types";

/** yyyymmddThhmmssZ, formato que exige el estándar iCalendar para fechas UTC. */
function toIcsDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function escapeIcsText(text: string): string {
  return text.replace(/[\\;,]/g, (c) => "\\" + c).replace(/\n/g, "\\n");
}

/** Arma un .ics de un solo evento y dispara la descarga en el navegador. */
export function downloadEventIcs(event: Event) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//OnEvent//ES",
    "BEGIN:VEVENT",
    `UID:${event.id}@onevent`,
    `DTSTAMP:${toIcsDate(new Date().toISOString())}`,
    `DTSTART:${toIcsDate(event.startDate)}`,
    `DTEND:${toIcsDate(event.endDate)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}`,
    `LOCATION:${escapeIcsText(event.location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${event.title.replace(/[^\w\-]+/g, "-")}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
