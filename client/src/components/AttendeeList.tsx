import type { Registration } from "../types";

interface Props {
  registrations: Registration[];
  onCheckIn: (registrationId: string) => void;
  checkingInId: string | null;
}

export function AttendeeList({ registrations, onCheckIn, checkingInId }: Props) {
  if (registrations.length === 0) {
    return <p className="empty-state">Todavía no hay inscritos en este evento.</p>;
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Email</th>
          <th>Estado</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {registrations.map((r) => (
          <tr key={r.id}>
            <td>{r.user?.name}</td>
            <td>{r.user?.email}</td>
            <td>
              {r.attendance ? (
                <span className="badge badge-success">✅ Asistió</span>
              ) : (
                <span className="badge badge-pending">Pendiente</span>
              )}
            </td>
            <td>
              {!r.attendance && (
                <button
                  className="btn btn-primary btn-sm"
                  disabled={checkingInId === r.id}
                  onClick={() => onCheckIn(r.id)}
                >
                  {checkingInId === r.id ? "Marcando…" : "Marcar asistencia"}
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
