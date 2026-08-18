import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createEvent, getEvent, updateEvent } from "../api/events";
import { getErrorMessage } from "../api/client";
import { useToast } from "../context/ToastContext";
import { IconCalendar, IconPin, IconUsers } from "../components/icons";
import { SkeletonBlock } from "../components/Skeleton";

/** Convierte un ISO string a formato aceptado por <input type="datetime-local">. */
function toInputValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const previewDateFormatter = new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short" });

export function EventFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [capacity, setCapacity] = useState(50);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getEvent(id)
      .then((event) => {
        setTitle(event.title);
        setDescription(event.description);
        setLocation(event.location);
        setStartDate(toInputValue(event.startDate));
        setEndDate(toInputValue(event.endDate));
        setCapacity(event.capacity);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const payload = { title, description, location, startDate, endDate, capacity: Number(capacity) };
    try {
      const event = isEditing && id ? await updateEvent(id, payload) : await createEvent(payload);
      toast.success(isEditing ? "Evento actualizado." : "Evento creado.");
      navigate(`/eventos/${event.id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <SkeletonBlock height={38} />
        <SkeletonBlock height={420} />
      </div>
    );
  }

  return (
    <div className="page">
      <h1>{isEditing ? "Editar evento" : "Crear evento"}</h1>

      <div className="event-form-layout">
        <form className="card event-form-card" onSubmit={handleSubmit}>
          {error && <p className="form-error">{error}</p>}

          <div className="form-section">
            <h3 className="form-section-title">Información básica</h3>
            <label>
              Título del evento
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Meetup de TypeScript"
                required
              />
            </label>
            <label>
              Descripción
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Contales a tus asistentes de qué se trata el evento"
                required
              />
            </label>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">
              <IconPin size={14} /> Lugar y horario
            </h3>
            <label>
              Ubicación
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ej: Auditorio Central, San Miguel de Tucumán"
                required
              />
            </label>
            <div className="form-row">
              <label>
                Inicio
                <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </label>
              <label>
                Fin
                <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
              </label>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">
              <IconUsers size={14} /> Capacidad
            </h3>
            <label>
              Cupos totales
              <input
                type="number"
                min={1}
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                required
              />
            </label>
          </div>

          <div className="event-form-actions">
            <Link to={isEditing && id ? `/eventos/${id}` : "/organizador"} className="btn btn-ghost">
              Cancelar
            </Link>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Guardando…" : isEditing ? "Guardar cambios" : "Crear evento"}
            </button>
          </div>
        </form>

        <aside className="event-preview-wrap">
          <span className="event-preview-label">Así se ve tu evento</span>
          <div className="card event-card event-preview-card">
            <h3>{title || "Título del evento"}</h3>
            <p className="meta-row">
              <span className="meta-item">
                <IconPin size={14} /> {location || "Ubicación"}
              </span>
              {startDate && (
                <span className="meta-item">
                  <IconCalendar size={14} /> {previewDateFormatter.format(new Date(startDate))}
                </span>
              )}
            </p>
            <p className="event-card-desc">{description || "La descripción de tu evento va a aparecer acá."}</p>
            <div className="event-card-footer">
              <span className="event-card-org">Tu organización</span>
              <span className="event-card-spots">{capacity || 0} cupos</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
