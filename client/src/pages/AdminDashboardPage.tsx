import { useCallback, useEffect, useState } from "react";
import * as adminApi from "../api/admin";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { IconList, IconShield, IconTrash, IconUsers } from "../components/icons";
import type { Role } from "../types";

const dateFormatter = new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" });

export function AdminDashboardPage() {
  const { user: me } = useAuth();
  const [mode, setMode] = useState<"stats" | "users">("stats");
  const [stats, setStats] = useState<adminApi.GlobalStats | null>(null);
  const [users, setUsers] = useState<adminApi.AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, usersData] = await Promise.all([adminApi.getGlobalStats(), adminApi.listUsers()]);
      setStats(statsData);
      setUsers(usersData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRoleChange(id: string, role: Role) {
    setBusyId(id);
    setError(null);
    try {
      const updated = await adminApi.updateUserRole(id, role);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updated } : u)));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar la cuenta de ${name}? Esta acción no se puede deshacer.`)) return;
    setBusyId(id);
    setError(null);
    try {
      await adminApi.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Panel de administración</h1>
      </div>

      <div className="tabs">
        <button className={`tab ${mode === "stats" ? "active" : ""}`} onClick={() => setMode("stats")}>
          <IconList size={15} /> Estadísticas
        </button>
        <button className={`tab ${mode === "users" ? "active" : ""}`} onClick={() => setMode("users")}>
          <IconUsers size={15} /> Usuarios
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}
      {loading && <p className="page-loading">Cargando…</p>}

      {!loading && mode === "stats" && stats && (
        <div className="stat-grid">
          <div className="card stat-tile">
            <span className="stat-tile-label">Usuarios registrados</span>
            <span className="stat-tile-value">{stats.users}</span>
          </div>
          <div className="card stat-tile">
            <span className="stat-tile-label">Eventos creados</span>
            <span className="stat-tile-value">{stats.events}</span>
          </div>
          <div className="card stat-tile">
            <span className="stat-tile-label">Inscripciones activas</span>
            <span className="stat-tile-value">{stats.registrations}</span>
          </div>
          <div className="card stat-tile">
            <span className="stat-tile-label">Asistencias registradas</span>
            <span className="stat-tile-value">
              {stats.attendance}
              {stats.registrations > 0 && <small> / {stats.registrations}</small>}
            </span>
            {stats.registrations > 0 && (
              <div className="stat-tile-bar">
                <div
                  className="stat-tile-bar-fill"
                  style={{ width: `${(stats.attendance / stats.registrations) * 100}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {!loading && mode === "users" && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Organización</th>
                <th>Inscripciones</th>
                <th>Desde</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u.id === me?.id;
                return (
                  <tr key={u.id}>
                    <td>
                      {u.name} {isSelf && <span className="badge badge-pending">Tú</span>}
                    </td>
                    <td>{u.email}</td>
                    <td>
                      {isSelf ? (
                        <span className="role-tag">{u.role}</span>
                      ) : (
                        <select
                          className="role-select"
                          value={u.role}
                          disabled={busyId === u.id}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                        >
                          <option value="ATTENDEE">ATTENDEE</option>
                          <option value="ORGANIZER">ORGANIZER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      )}
                    </td>
                    <td>
                      {u.organization ? `${u.organization.name} (${u.organization._count.events})` : "—"}
                    </td>
                    <td>{u._count.registrations}</td>
                    <td>{dateFormatter.format(new Date(u.createdAt))}</td>
                    <td>
                      {!isSelf && (
                        <button
                          className="btn btn-danger btn-sm"
                          disabled={busyId === u.id}
                          onClick={() => handleDelete(u.id, u.name)}
                        >
                          <IconTrash size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && mode === "users" && users.length === 0 && (
        <p className="empty-state">
          <IconShield size={14} /> No hay usuarios para mostrar.
        </p>
      )}
    </div>
  );
}
