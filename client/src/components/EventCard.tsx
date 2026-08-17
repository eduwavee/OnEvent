import { Link } from "react-router-dom";
import type { Event } from "../types";

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function EventCard({ event }: { event: Event }) {
  const spotsLeft = event.capacity - event._count.registrations;

  return (
    <Link to={`/eventos/${event.id}`} className="card event-card">
      <h3>{event.title}</h3>
      <p className="event-card-meta">
        📍 {event.location} · 🗓️ {dateFormatter.format(new Date(event.startDate))}
      </p>
      <p className="event-card-desc">{event.description}</p>
      <p className={`event-card-spots ${spotsLeft <= 0 ? "full" : ""}`}>
        {spotsLeft > 0 ? `${spotsLeft} cupos disponibles` : "Sin cupos"}
      </p>
    </Link>
  );
}
