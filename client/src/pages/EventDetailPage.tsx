import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteEvent, getEvent } from "../api/events";
import { cancelMyRegistration, getMyTicket, registerToEvent } from "../api/registrations";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import type { Event, Registration } from "../types";

const dateFormatter = new Intl.DateTimeFormat("es-ES", { dateStyle: "full", timeStyle: "short" });

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [myRegistration, setMyRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const eventData = await getEvent(id);
      setEvent(eventData);

      if (user?.role === "ATTENDEE") {
        try {
          const ticket = await getMyTicket(id);
          setMyRegistration(ticket.registration);
        } catch (err) {
          if (!axios.isAxiosError(err) || err.response?.status !== 404) throw err;
          setMyRegistration(null);
        }
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRegister() {
    if (!id) return;
    setActionLoading(true);
    setError(null);
    try {
      await registerToEvent(id);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancel() {
    if (!id) return;
    setActionLoading(true);
    setError(null);
    try {
      await cancelMyRegistration(id);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    if (!confirm("¿Seguro que quieres eliminar este evento? Esta acción no se puede deshacer.")) return;
    setActionLoading(true);
    try {
      await deleteEvent(id);
      navigate("/organizador");
    } catch (err) {
      setError(getErrorMessage(err));
      setActionLoading(false);
    }
  }

  if (loading) return <p className="page-loading">Cargando evento…</p>;
  if (!event) return <p className="form-error">{error || "Evento no encontrado"}</p>;

  const isOwner = user && (user.id === event.organizerId || user.role === "ADMIN");
  const spotsLeft = event.capacity - event._count.registrations;

  return (
    <div className="page event-detail">
      <h1>{event.title}</h1>
      <p className="event-card-meta">
        📍 {event.location} · 🗓️ {dateFormatter.format(new Date(event.startDate))} →{" "}
        {dateFormatter.format(new Date(event.endDate))}
      </p>
      <p>Organiza: {event.organizer.name}</p>
      <p className="event-detail-desc">{event.description}</p>
      <p className={spotsLeft <= 0 ? "event-card-spots full" : "event-card-spots"}>
        {spotsLeft > 0 ? `${spotsLeft} cupos disponibles de ${event.capacity}` : "Sin cupos disponibles"}
      </p>

      {error && <p className="form-error">{error}</p>}

      <div className="event-detail-actions">
        {user?.role === "ATTENDEE" &&
          (myRegistration ? (
            <>
              <span className="badge badge-success">Ya estás inscrito</span>
              <Link to="/mis-inscripciones" className="btn btn-ghost">
                Ver mi ticket
              </Link>
              <button className="btn btn-danger" disabled={actionLoading} onClick={handleCancel}>
                Cancelar inscripción
              </button>
            </>
          ) : (
            <button className="btn btn-primary" disabled={actionLoading || spotsLeft <= 0} onClick={handleRegister}>
              {actionLoading ? "Inscribiendo…" : "Inscribirme"}
            </button>
          ))}

        {isOwner && (
          <>
            <Link to={`/eventos/${event.id}/editar`} className="btn btn-ghost">
              Editar
            </Link>
            <Link to={`/eventos/${event.id}/check-in`} className="btn btn-primary">
              Check-in de asistencia
            </Link>
            <button className="btn btn-danger" disabled={actionLoading} onClick={handleDelete}>
              Eliminar evento
            </button>
          </>
        )}
      </div>
    </div>
  );
}
