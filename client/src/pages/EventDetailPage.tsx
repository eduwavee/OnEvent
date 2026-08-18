import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteEvent, getEvent } from "../api/events";
import { cancelMyRegistration, getMyTicket, registerToEvent } from "../api/registrations";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useConfirm } from "../context/ConfirmContext";
import { useToast } from "../context/ToastContext";
import { downloadEventIcs } from "../lib/ics";
import type { Event, Registration } from "../types";
import { IconCalendar, IconEdit, IconPin, IconScan, IconShare, IconTrash } from "../components/icons";
import { SkeletonBlock } from "../components/Skeleton";

const dateFormatter = new Intl.DateTimeFormat("es-ES", { dateStyle: "full", timeStyle: "short" });

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
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
      const registration = await registerToEvent(id);
      toast.success(
        registration.status === "WAITLISTED"
          ? "Te anotamos en la lista de espera. Te avisamos si se libera un cupo."
          : "Te inscribiste correctamente. Ya tenés tu ticket con QR."
      );
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
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
      toast.success("Inscripción cancelada.");
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    const ok = await confirm({
      title: "¿Eliminar este evento?",
      message: "Se cancelarán todas las inscripciones asociadas. Esta acción no se puede deshacer.",
      confirmLabel: "Eliminar evento",
      danger: true,
    });
    if (!ok) return;
    setActionLoading(true);
    try {
      await deleteEvent(id);
      toast.success("Evento eliminado.");
      navigate("/organizador");
    } catch (err) {
      toast.error(getErrorMessage(err));
      setActionLoading(false);
    }
  }

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: event?.title, url });
      } catch {
        // el usuario cerró el selector de compartir: no es un error
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado al portapapeles.");
    } catch {
      toast.error("No se pudo copiar el link. Copialo manualmente: " + url);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <SkeletonBlock height={38} />
        <SkeletonBlock height={20} />
        <SkeletonBlock height={90} />
      </div>
    );
  }
  if (!event) return <p className="form-error">{error || "Evento no encontrado"}</p>;

  const isOwner = user && (user.organizationId === event.organizationId || user.role === "ADMIN");
  const spotsLeft = event.capacity - event._count.registrations;
  const isFull = spotsLeft <= 0;

  return (
    <div className="page event-detail">
      {event.imageUrl && <img src={event.imageUrl} alt="" className="event-detail-banner" />}
      <h1>{event.title}</h1>
      <p className="meta-row">
        <span className="meta-item">
          <IconPin size={14} /> {event.location}
        </span>
        <span className="meta-item">
          <IconCalendar size={14} /> {dateFormatter.format(new Date(event.startDate))} →{" "}
          {dateFormatter.format(new Date(event.endDate))}
        </span>
      </p>
      <p>
        Organiza:{" "}
        <Link to={`/organizaciones/${event.organization.id}`} className="inline-link">
          {event.organization.name}
        </Link>
      </p>
      <p className="event-detail-desc">{event.description}</p>
      <p className={isFull ? "event-card-spots full" : "event-card-spots"}>
        {spotsLeft > 0 ? `${spotsLeft} cupos disponibles de ${event.capacity}` : "Sin cupos disponibles"}
      </p>

      {error && <p className="form-error">{error}</p>}

      <div className="event-detail-actions">
        {user?.role === "ATTENDEE" &&
          (myRegistration ? (
            <>
              {myRegistration.status === "WAITLISTED" ? (
                <span className="badge badge-pending">Estás en lista de espera</span>
              ) : (
                <>
                  <span className="badge badge-success">Ya estás inscrito</span>
                  <Link to="/mis-inscripciones" className="btn btn-ghost">
                    Ver mi ticket
                  </Link>
                </>
              )}
              <button className="btn btn-danger" disabled={actionLoading} onClick={handleCancel}>
                Cancelar inscripción
              </button>
            </>
          ) : (
            <button className="btn btn-primary" disabled={actionLoading} onClick={handleRegister}>
              {actionLoading ? "Un momento…" : isFull ? "Anotarme en lista de espera" : "Inscribirme"}
            </button>
          ))}

        <button className="btn btn-ghost" onClick={() => downloadEventIcs(event)}>
          <IconCalendar size={15} /> Agregar al calendario
        </button>
        <button className="btn btn-ghost" onClick={handleShare}>
          <IconShare size={15} /> Compartir
        </button>

        {isOwner && (
          <>
            <Link to={`/eventos/${event.id}/editar`} className="btn btn-ghost">
              <IconEdit size={15} /> Editar
            </Link>
            <Link to={`/eventos/${event.id}/check-in`} className="btn btn-primary">
              <IconScan size={15} /> Check-in de asistencia
            </Link>
            <button className="btn btn-danger" disabled={actionLoading} onClick={handleDelete}>
              <IconTrash size={15} /> Eliminar evento
            </button>
          </>
        )}
      </div>
    </div>
  );
}
