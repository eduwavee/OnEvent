import { motion } from "framer-motion";
import type { EventStat } from "../api/organizations";

/**
 * Barras de "inscriptos vs. asistieron" por evento, contra el fondo de la
 * capacidad total. Un solo hue (azul) en dos intensidades: clara para
 * inscriptos, plena para asistieron — magnitud dentro de una misma serie,
 * no identidad, así que no hace falta paleta categórica.
 */
export function AttendanceChart({ stats }: { stats: EventStat[] }) {
  if (stats.length === 0) {
    return <p className="empty-state">Todavía no hay eventos con inscripciones para mostrar.</p>;
  }

  return (
    <div className="attendance-chart">
      <div className="attendance-chart-legend">
        <span className="legend-item">
          <span className="legend-swatch legend-swatch-registered" /> Inscriptos
        </span>
        <span className="legend-item">
          <span className="legend-swatch legend-swatch-attended" /> Asistieron
        </span>
      </div>

      <ul className="attendance-chart-rows">
        {stats.map((s) => {
          const registeredPct = s.capacity ? Math.min(100, (s.registered / s.capacity) * 100) : 0;
          const attendedPct = s.capacity ? Math.min(100, (s.attended / s.capacity) * 100) : 0;
          return (
            <li key={s.eventId} className="attendance-chart-row">
              <div className="attendance-chart-row-label">
                <span className="attendance-chart-row-title">{s.title}</span>
                <span className="attendance-chart-row-figures">
                  {s.attended} / {s.registered} inscriptos · {s.capacity} cupos
                </span>
              </div>
              <div className="attendance-chart-track">
                <motion.div
                  className="attendance-chart-fill attendance-chart-fill-registered"
                  initial={{ width: 0 }}
                  animate={{ width: `${registeredPct}%` }}
                  transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
                />
                <motion.div
                  className="attendance-chart-fill attendance-chart-fill-attended"
                  initial={{ width: 0 }}
                  animate={{ width: `${attendedPct}%` }}
                  transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1], delay: 0.1 }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
