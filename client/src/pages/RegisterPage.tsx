import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("ATTENDEE");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(name, email, password, role);
      navigate("/");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-form" onSubmit={handleSubmit}>
        <h2>Crear cuenta</h2>
        {error && <p className="form-error">{error}</p>}
        <label>
          Nombre
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </label>
        <label>
          Tipo de cuenta
          <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
            <option value="ATTENDEE">Asistente — quiero inscribirme a eventos</option>
            <option value="ORGANIZER">Organizador — quiero crear y gestionar eventos</option>
          </select>
        </label>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Creando…" : "Crear cuenta"}
        </button>
        <p className="auth-switch">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </form>
    </div>
  );
}
