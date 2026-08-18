import { AnimatePresence, motion } from "framer-motion";
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { checkIn, getAttendanceStats, type AttendanceStats } from "../api/attendance";
import { getEvent } from "../api/events";
import { listEventRegistrations } from "../api/registrations";
import { getErrorMessage } from "../api/client";
import { AttendeeList } from "../components/AttendeeList";
import { IconCheckCircle, IconDownload, IconList, IconScan } from "../components/icons";
import { SkeletonBlock } from "../components/Skeleton";
import { downloadCsv } from "../lib/csv";
import type { Event, Registration } from "../types";

// html5-qrcode es pesado (~200KB); solo se carga si se abre la pestaña de escaneo.
const QRScanner = lazy(() => import("../components/QRScanner").then((m) => ({ default: m.QRScanner })));

export function CheckInPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [mode, setMode] = useState<"manual" | "qr">("manual");
  const [checkingInId, setCheckingInId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ id: number; type: "success" | "error"; text: string } | null>(null);
  const lastScan = useRef<{ token: string; at: number } | null>(null);
  const messageId = useRef(0);

  const load = useCallback(async () => {
    if (!id) return;
    const [eventData, regs, statsData] = await Promise.all([
      getEvent(id),
      listEventRegistrations(id),
      getAttendanceStats(id),
    ]);
    setEvent(eventData);
    setRegistrations(regs);
    setStats(statsData);
  }, [id]);

  useEffect(() => {
    load().catch((err) => setMessage({ id: ++messageId.current, type: "error", text: getErrorMessage(err) }));
  }, [load]);

  async function handleCheckIn(payload: { registrationId?: string; qrToken?: string }) {
    if (!id) return;
    if (payload.registrationId) setCheckingInId(payload.registrationId);
    try {
      const result = await checkIn(id, payload);
      setMessage({ id: ++messageId.current, type: "success", text: `Asistencia registrada: ${result.attendee.name}` });
      await load();
    } catch (err) {
      setMessage({ id: ++messageId.current, type: "error", text: getErrorMessage(err) });
    } finally {
      setCheckingInId(null);
    }
  }

  if (!event) {
    return (
      <div className="page">
        <SkeletonBlock height={38} />
        <SkeletonBlock height={80} />
        <SkeletonBlock height={200} />
      </div>
    );
  }

  function handleExportCsv() {
    downloadCsv(
      `inscritos-${event!.title}`,
      registrations.map((r) => ({
        Nombre: r.user?.name || "",
        Email: r.user?.email || "",
        Estado: r.attendance ? "Asistió" : "Pendiente",
      }))
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Check-in: {event.title}</h1>
        <button className="btn btn-ghost btn-sm" onClick={handleExportCsv} disabled={registrations.length === 0}>
          <IconDownload size={14} /> Exportar CSV
        </button>
      </div>
      {stats && (
        <div className="stat-grid">
          <div className="card stat-tile">
            <span className="stat-tile-label">Asistieron</span>
            <span className="stat-tile-value">
              {stats.attended} <small>/ {stats.registered} inscritos</small>
            </span>
            <div className="stat-tile-bar">
              <motion.div
                className="stat-tile-bar-fill"
                animate={{ width: `${stats.registered ? (stats.attended / stats.registered) * 100 : 0}%` }}
                transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
              />
            </div>
          </div>
          <div className="card stat-tile">
            <span className="stat-tile-label">Capacidad ocupada</span>
            <span className="stat-tile-value">
              {stats.registered} <small>/ {stats.capacity} cupos</small>
            </span>
            <div className="stat-tile-bar">
              <motion.div
                className="stat-tile-bar-fill"
                animate={{ width: `${stats.capacity ? (stats.registered / stats.capacity) * 100 : 0}%` }}
                transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="tabs">
        <button className={`tab ${mode === "manual" ? "active" : ""}`} onClick={() => setMode("manual")}>
          <IconList size={15} /> Lista manual
        </button>
        <button className={`tab ${mode === "qr" ? "active" : ""}`} onClick={() => setMode("qr")}>
          <IconScan size={15} /> Escanear QR
        </button>
      </div>

      <AnimatePresence mode="wait">
        {message && (
          <motion.p
            key={message.id}
            initial={{ opacity: 0, scale: 0.97, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className={message.type === "success" ? "form-success" : "form-error"}
          >
            {message.type === "success" && <IconCheckCircle size={15} />}
            {message.text}
          </motion.p>
        )}
      </AnimatePresence>

      {mode === "manual" ? (
        <AttendeeList
          registrations={registrations}
          checkingInId={checkingInId}
          onCheckIn={(registrationId) => handleCheckIn({ registrationId })}
        />
      ) : (
        <div className="card">
          <Suspense fallback={<SkeletonBlock height={280} />}>
            <QRScanner
              onScan={(qrToken) => {
                // Evita reintentar el mismo QR repetidamente mientras sigue frente a la cámara.
                const now = Date.now();
                if (lastScan.current?.token === qrToken && now - lastScan.current.at < 4000) return;
                lastScan.current = { token: qrToken, at: now };
                handleCheckIn({ qrToken });
              }}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}
