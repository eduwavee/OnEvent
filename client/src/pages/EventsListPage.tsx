import { useEffect, useState } from "react";
import { listEvents } from "../api/events";
import { getErrorMessage } from "../api/client";
import { EventCard } from "../components/EventCard";
import { SkeletonCardGrid } from "../components/Skeleton";
import { StaggerGrid, StaggerItem } from "../components/StaggerGrid";
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
      {loading && <SkeletonCardGrid count={6} />}
      {error && <p className="form-error">{error}</p>}
      {!loading && events.length === 0 && <p className="empty-state">Todavía no hay eventos publicados.</p>}
      {!loading && events.length > 0 && (
        <StaggerGrid>
          {events.map((event) => (
            <StaggerItem key={event.id}>
              <EventCard event={event} />
            </StaggerItem>
          ))}
        </StaggerGrid>
      )}
    </div>
  );
}
