import { useEffect, useMemo, useState } from "react";
import { listEvents } from "../api/events";
import { getErrorMessage } from "../api/client";
import { EventCard } from "../components/EventCard";
import { IconSearch, IconX } from "../components/icons";
import { SkeletonCardGrid } from "../components/Skeleton";
import { StaggerGrid, StaggerItem } from "../components/StaggerGrid";
import type { Event } from "../types";

export function EventsListPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    listEvents()
      .then(setEvents)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return events;
    return events.filter((e) =>
      [e.title, e.location, e.organization.name].some((field) => field.toLowerCase().includes(q))
    );
  }, [events, query]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Próximos eventos</h1>
        {!loading && (
          <span className="result-count">
            {filtered.length} {filtered.length === 1 ? "evento" : "eventos"}
          </span>
        )}
      </div>

      {!loading && events.length > 0 && (
        <div className="search-bar">
          <IconSearch size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título, lugar u organización…"
            aria-label="Buscar eventos"
          />
          {query && (
            <button type="button" className="search-clear" onClick={() => setQuery("")} aria-label="Limpiar búsqueda">
              <IconX size={14} />
            </button>
          )}
        </div>
      )}

      {loading && <SkeletonCardGrid count={6} />}
      {error && <p className="form-error">{error}</p>}
      {!loading && events.length === 0 && <p className="empty-state">Todavía no hay eventos publicados.</p>}
      {!loading && events.length > 0 && filtered.length === 0 && (
        <p className="empty-state">Ningún evento coincide con "{query}".</p>
      )}

      {!loading && filtered.length > 0 && (
        <StaggerGrid>
          {filtered.map((event) => (
            <StaggerItem key={event.id}>
              <EventCard event={event} />
            </StaggerItem>
          ))}
        </StaggerGrid>
      )}
    </div>
  );
}
