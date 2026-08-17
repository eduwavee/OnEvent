import type { Event } from "../types";

interface Props {
  event: Event;
  qrDataUrl: string;
  checkedIn: boolean;
}

export function QRTicket({ event, qrDataUrl, checkedIn }: Props) {
  return (
    <div className="card qr-ticket">
      <div className="qr-ticket-info">
        <h3>{event.title}</h3>
        <p>📍 {event.location}</p>
        <p>🗓️ {new Date(event.startDate).toLocaleString("es-ES")}</p>
        <span className={`badge ${checkedIn ? "badge-success" : "badge-pending"}`}>
          {checkedIn ? "✅ Asistencia registrada" : "Presenta este QR en el ingreso"}
        </span>
      </div>
      <img src={qrDataUrl} alt={`Código QR de tu ticket para ${event.title}`} className="qr-ticket-img" />
    </div>
  );
}
