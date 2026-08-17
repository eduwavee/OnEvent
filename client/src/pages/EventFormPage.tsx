import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createEvent, getEvent, updateEvent } from "../api/events";
import { getErrorMessage } from "../api/client";

/** Convierte un ISO string a formato aceptado por <input type="datetime-local">. */
function toInputValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EventFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

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
      navigate(`/eventos/${event.id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="page-loading">Cargando…</p>;

  return (
    <div className="page">
      <form className="card event-form" onSubmit={handleSubmit}>
        <h2>{isEditing ? "Editar evento" : "Crear evento"}</h2>
        {error && <p className="form-error">{error}</p>}
        <label>
          Título
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label>
          Descripción
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required />
        </label>
        <label>
          Ubicación
          <input value={location} onChange={(e) => setLocation(e.target.value)} required />
        </label>
        <div className="form-row">
          <label>
            Fecha y hora de inicio
            <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          </label>
          <label>
            Fecha y hora de fin
            <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
          </label>
        </div>
        <label>
          Capacidad (cupos totales)
          <input
            type="number"
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            required
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Guardando…" : isEditing ? "Guardar cambios" : "Crear evento"}
        </button>
      </form>
    </div>
  );
}
