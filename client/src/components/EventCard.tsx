import { Link } from "react-router-dom";
import type { Event } from "../types";
import { IconCalendar, IconPin } from "./icons";

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function EventCard({ event }: { event: Event }) {
  const spotsLeft = event.capacity - event._count.registrations;

  return (
    <Link to={`/eventos/${event.id}`} className="card event-card">
      {event.imageUrl && (
        <img
          src={event.imageUrl}
          alt=""
          className="event-card-image"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      )}
      <h3>{event.title}</h3>
      <p className="meta-row">
        <span className="meta-item">
          <IconPin size={14} /> {event.location}
        </span>
        <span className="meta-item">
          <IconCalendar size={14} /> {dateFormatter.format(new Date(event.startDate))}
        </span>
      </p>
      <p className="event-card-desc">{event.description}</p>
      <div className="event-card-footer">
        <span className="event-card-org">{event.organization.name}</span>
        <span className={`event-card-spots ${spotsLeft <= 0 ? "full" : ""}`}>
          {spotsLeft > 0 ? `${spotsLeft} cupos` : "Sin cupos"}
        </span>
      </div>
    </Link>
  );
}
