import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { checkIn, getAttendanceStats, type AttendanceStats } from "../api/attendance";
import { getEvent } from "../api/events";
import { listEventRegistrations } from "../api/registrations";
import { getErrorMessage } from "../api/client";
import { AttendeeList } from "../components/AttendeeList";
import { QRScanner } from "../components/QRScanner";
import { IconCheckCircle, IconList, IconScan } from "../components/icons";
import type { Event, Registration } from "../types";

export function CheckInPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [mode, setMode] = useState<"manual" | "qr">("manual");
  const [checkingInId, setCheckingInId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const lastScan = useRef<{ token: string; at: number } | null>(null);

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
    load().catch((err) => setMessage({ type: "error", text: getErrorMessage(err) }));
  }, [load]);

  async function handleCheckIn(payload: { registrationId?: string; qrToken?: string }) {
    if (!id) return;
    setMessage(null);
    if (payload.registrationId) setCheckingInId(payload.registrationId);
    try {
      const result = await checkIn(id, payload);
      setMessage({ type: "success", text: `Asistencia registrada: ${result.attendee.name}` });
      await load();
    } catch (err) {
      setMessage({ type: "error", text: getErrorMessage(err) });
    } finally {
      setCheckingInId(null);
    }
  }

  if (!event) return <p className="page-loading">Cargando…</p>;

  return (
    <div className="page">
      <h1>Check-in: {event.title}</h1>
      {stats && (
        <div className="stat-grid">
          <div className="card stat-tile">
            <span className="stat-tile-label">Asistieron</span>
            <span className="stat-tile-value">
              {stats.attended} <small>/ {stats.registered} inscritos</small>
            </span>
            <div className="stat-tile-bar">
              <div
                className="stat-tile-bar-fill"
                style={{ width: `${stats.registered ? (stats.attended / stats.registered) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div className="card stat-tile">
            <span className="stat-tile-label">Capacidad ocupada</span>
            <span className="stat-tile-value">
              {stats.registered} <small>/ {stats.capacity} cupos</small>
            </span>
            <div className="stat-tile-bar">
              <div
                className="stat-tile-bar-fill"
                style={{ width: `${stats.capacity ? (stats.registered / stats.capacity) * 100 : 0}%` }}
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

      {message && (
        <p className={message.type === "success" ? "form-success" : "form-error"}>
          {message.type === "success" && <IconCheckCircle size={15} />}
          {message.text}
        </p>
      )}

      {mode === "manual" ? (
        <AttendeeList
          registrations={registrations}
          checkingInId={checkingInId}
          onCheckIn={(registrationId) => handleCheckIn({ registrationId })}
        />
      ) : (
        <div className="card">
          <QRScanner
            onScan={(qrToken) => {
              // Evita reintentar el mismo QR repetidamente mientras sigue frente a la cámara.
              const now = Date.now();
              if (lastScan.current?.token === qrToken && now - lastScan.current.at < 4000) return;
              lastScan.current = { token: qrToken, at: now };
              handleCheckIn({ qrToken });
            }}
          />
        </div>
      )}
    </div>
  );
}
