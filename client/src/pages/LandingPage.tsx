import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listEvents } from "../api/events";
import { EventCard } from "../components/EventCard";
import { IconCalendar, IconScan, IconShield, IconUsers } from "../components/icons";
import type { Event } from "../types";

const BENEFITS = [
  {
    icon: IconUsers,
    title: "Control de aforo en tiempo real",
    text: "Cada inscripción descuenta cupo al instante — nunca vendés ni un lugar de más.",
  },
  {
    icon: IconScan,
    title: "Check-in con QR o lista manual",
    text: "Escaneá el ticket de cada asistente en la puerta, o marcá la asistencia a mano si hace falta.",
  },
  {
    icon: IconShield,
    title: "Panel para tu organización",
    text: "Creá, editá y cerrá eventos, y mirá las estadísticas de asistencia de todo tu equipo.",
  },
];

export function LandingPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listEvents()
      .then((all) => setEvents(all.slice(0, 4)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="landing">
      <section className="landing-hero">
        <span className="eyebrow">Gestión de eventos</span>
        <h1>
          Organizá eventos.
          <br />
          Controlá quién entra.
        </h1>
        <p className="landing-hero-sub">
          Inscripciones con cupo, tickets con QR y check-in en la puerta — todo en un solo lugar,
          para tu organización y tus asistentes.
        </p>
        <div className="landing-hero-actions">
          <Link to="/eventos" className="btn btn-primary">
            Ver eventos
          </Link>
          <Link to="/registro?role=organizer" className="btn btn-ghost">
            Registrar tu organización
          </Link>
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-section-header">
          <h2>Próximos eventos</h2>
          <Link to="/eventos" className="landing-see-all">
            Ver todos →
          </Link>
        </div>

        {loading && <p className="page-loading">Cargando…</p>}
        {!loading && events.length === 0 && (
          <p className="empty-state">
            <IconCalendar size={14} /> Todavía no hay eventos publicados. ¡Sé la primera organización en crear uno!
          </p>
        )}
        <div className="grid">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      <section className="landing-section landing-cta">
        <div className="landing-section-header">
          <h2>¿Tu organización hace eventos?</h2>
          <p className="landing-cta-sub">
            Publicalos en un calendario propio, con control de cupo y asistencia desde el día uno.
          </p>
        </div>

        <div className="benefit-grid">
          {BENEFITS.map(({ icon: Icon, title, text }) => (
            <div className="card benefit-tile" key={title}>
              <div className="benefit-icon">
                <Icon size={20} />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>

        <div className="landing-cta-actions">
          <Link to="/registro?role=organizer" className="btn btn-primary">
            Registrar tu organización
          </Link>
          <Link to="/login" className="btn btn-ghost">
            Ya tengo cuenta
          </Link>
        </div>
      </section>
    </div>
  );
}
