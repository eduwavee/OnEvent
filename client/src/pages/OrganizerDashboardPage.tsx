import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listEvents } from "../api/events";
import { getErrorMessage } from "../api/client";
import { EventCard } from "../components/EventCard";
import type { Event } from "../types";

export function OrganizerDashboardPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listEvents(true)
      .then(setEvents)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Mis eventos</h1>
        <Link to="/eventos/nuevo" className="btn btn-primary">
          + Crear evento
        </Link>
      </div>
      {loading && <p className="page-loading">Cargando…</p>}
      {error && <p className="form-error">{error}</p>}
      {!loading && events.length === 0 && (
        <p className="empty-state">Todavía no has creado ningún evento.</p>
      )}
      <div className="grid">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
