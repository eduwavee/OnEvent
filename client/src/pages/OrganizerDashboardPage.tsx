import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listEvents } from "../api/events";
import { getErrorMessage } from "../api/client";
import { EventCard } from "../components/EventCard";
import { IconPlus } from "../components/icons";
import { SkeletonCardGrid } from "../components/Skeleton";
import { StaggerGrid, StaggerItem } from "../components/StaggerGrid";
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
          <IconPlus size={15} /> Crear evento
        </Link>
      </div>
      {loading && <SkeletonCardGrid />}
      {error && <p className="form-error">{error}</p>}
      {!loading && events.length === 0 && (
        <p className="empty-state">Todavía no has creado ningún evento.</p>
      )}
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
