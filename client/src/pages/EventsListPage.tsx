import { useEffect, useState } from "react";
import { listEvents } from "../api/events";
import { getErrorMessage } from "../api/client";
import { EventCard } from "../components/EventCard";
import type { Event } from "../types";

export function EventsListPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listEvents()
      .then(setEvents)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <h1>Próximos eventos</h1>
      {loading && <p className="page-loading">Cargando eventos…</p>}
      {error && <p className="form-error">{error}</p>}
      {!loading && events.length === 0 && <p className="empty-state">Todavía no hay eventos publicados.</p>}
      <div className="grid">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
