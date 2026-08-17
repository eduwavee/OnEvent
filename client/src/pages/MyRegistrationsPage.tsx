import { useEffect, useState } from "react";
import { getMyTicket, listMyRegistrations } from "../api/registrations";
import { getErrorMessage } from "../api/client";
import { QRTicket } from "../components/QRTicket";
import { SkeletonBlock } from "../components/Skeleton";
import type { Event, Registration } from "../types";

interface Ticket {
  registration: Registration;
  qrDataUrl: string;
}

export function MyRegistrationsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const registrations = await listMyRegistrations();
        const withQr = await Promise.all(
          registrations.map((r) => getMyTicket(r.eventId).then((t) => ({ registration: t.registration, qrDataUrl: t.qrDataUrl })))
        );
        setTickets(withQr);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="page">
      <h1>Mis inscripciones</h1>
      {loading && (
        <div className="ticket-list">
          <SkeletonBlock height={140} />
          <SkeletonBlock height={140} />
        </div>
      )}
      {error && <p className="form-error">{error}</p>}
      {!loading && tickets.length === 0 && (
        <p className="empty-state">Todavía no te has inscrito a ningún evento.</p>
      )}
      <div className="ticket-list">
        {tickets.map(({ registration, qrDataUrl }) => (
          <QRTicket
            key={registration.id}
            event={registration.event as Event}
            qrDataUrl={qrDataUrl}
            checkedIn={Boolean(registration.attendance)}
          />
        ))}
      </div>
    </div>
  );
}
