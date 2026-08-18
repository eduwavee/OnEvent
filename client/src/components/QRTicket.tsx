import type { Event } from "../types";
import { IconCalendar, IconCheckCircle, IconClock, IconPin } from "./icons";

interface Props {
  event: Event;
  qrDataUrl: string | null;
  checkedIn: boolean;
  waitlisted?: boolean;
}

export function QRTicket({ event, qrDataUrl, checkedIn, waitlisted }: Props) {
  return (
    <div className="card qr-ticket">
      <div className="qr-ticket-info">
        <h3>{event.title}</h3>
        <p className="meta-row">
          <span className="meta-item">
            <IconPin size={14} /> {event.location}
          </span>
          <span className="meta-item">
            <IconCalendar size={14} /> {new Date(event.startDate).toLocaleString("es-ES")}
          </span>
        </p>
        {waitlisted ? (
          <span className="badge badge-pending">
            <IconClock size={13} /> En lista de espera — te avisamos si se libera un cupo
          </span>
        ) : (
          <span className={`badge ${checkedIn ? "badge-success" : "badge-pending"}`}>
            {checkedIn ? (
              <>
                <IconCheckCircle size={13} /> Asistencia registrada
              </>
            ) : (
              "Presenta este QR en el ingreso"
            )}
          </span>
        )}
      </div>
      {qrDataUrl && (
        <img src={qrDataUrl} alt={`Código QR de tu ticket para ${event.title}`} className="qr-ticket-img" />
      )}
    </div>
  );
}
