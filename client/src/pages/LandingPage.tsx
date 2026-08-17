import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listEvents } from "../api/events";
import { getPublicStats, type PublicStats } from "../api/stats";
import { AnimatedCounter } from "../components/AnimatedCounter";
import { EventCard } from "../components/EventCard";
import { IconCalendar, IconScan, IconShield, IconUsers } from "../components/icons";
import { ScrollReveal } from "../components/ScrollReveal";
import { SkeletonCardGrid } from "../components/Skeleton";
import { StaggerGrid, StaggerItem } from "../components/StaggerGrid";
import { fadeInUp, staggerContainer } from "../lib/motion";
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
  const [stats, setStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    listEvents()
      .then((all) => setEvents(all.slice(0, 4)))
      .finally(() => setLoading(false));
    getPublicStats()
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  return (
    <div className="landing">
      <motion.section className="landing-hero" variants={staggerContainer} initial="hidden" animate="show">
        <div className="landing-glow" aria-hidden="true" />
        <motion.span className="eyebrow" variants={fadeInUp}>
          Gestión de eventos
        </motion.span>
        <motion.h1 variants={fadeInUp}>
          Organizá eventos.
          <br />
          Controlá quién entra.
        </motion.h1>
        <motion.p className="landing-hero-sub" variants={fadeInUp}>
          Inscripciones con cupo, tickets con QR y check-in en la puerta — todo en un solo lugar,
          para tu organización y tus asistentes.
        </motion.p>
        <motion.div className="landing-hero-actions" variants={fadeInUp}>
          <Link to="/eventos" className="btn btn-primary">
            Ver eventos
          </Link>
          <Link to="/registro?role=organizer" className="btn btn-ghost">
            Registrar tu organización
          </Link>
        </motion.div>

        {stats && (
          <motion.div className="landing-stats" variants={fadeInUp}>
            <div className="landing-stat">
              <span className="landing-stat-value">
                <AnimatedCounter value={stats.organizations} />
              </span>
              <span className="landing-stat-label">Organizaciones</span>
            </div>
            <div className="landing-stat">
              <span className="landing-stat-value">
                <AnimatedCounter value={stats.events} />
              </span>
              <span className="landing-stat-label">Eventos publicados</span>
            </div>
            <div className="landing-stat">
              <span className="landing-stat-value">
                <AnimatedCounter value={stats.attendance} />
              </span>
              <span className="landing-stat-label">Check-ins realizados</span>
            </div>
          </motion.div>
        )}
      </motion.section>

      <section className="landing-section">
        <ScrollReveal className="landing-section-header">
          <h2>Próximos eventos</h2>
          <Link to="/eventos" className="landing-see-all">
            Ver todos →
          </Link>
        </ScrollReveal>

        {loading && <SkeletonCardGrid count={4} />}
        {!loading && events.length === 0 && (
          <p className="empty-state">
            <IconCalendar size={14} /> Todavía no hay eventos publicados. ¡Sé la primera organización en crear uno!
          </p>
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
      </section>

      <ScrollReveal className="landing-section landing-cta">
        <div className="landing-section-header">
          <h2>¿Tu organización hace eventos?</h2>
          <p className="landing-cta-sub">
            Publicalos en un calendario propio, con control de cupo y asistencia desde el día uno.
          </p>
        </div>

        <motion.div
          className="benefit-grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          {BENEFITS.map(({ icon: Icon, title, text }) => (
            <motion.div className="card benefit-tile" key={title} variants={fadeInUp}>
              <div className="benefit-icon">
                <Icon size={20} />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="landing-cta-actions">
          <Link to="/registro?role=organizer" className="btn btn-primary">
            Registrar tu organización
          </Link>
          <Link to="/login" className="btn btn-ghost">
            Ya tengo cuenta
          </Link>
        </div>
      </ScrollReveal>
    </div>
  );
}
