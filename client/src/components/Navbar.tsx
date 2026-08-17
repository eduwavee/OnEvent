import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <NavLink to="/" className="navbar-brand">
        📅 Gestión de Eventos
      </NavLink>
      <nav className="navbar-links">
        <NavLink to="/">Eventos</NavLink>
        {user && <NavLink to="/mis-inscripciones">Mis inscripciones</NavLink>}
        {(user?.role === "ORGANIZER" || user?.role === "ADMIN") && (
          <NavLink to="/organizador">Mis eventos</NavLink>
        )}
      </nav>
      <div className="navbar-user">
        {user ? (
          <>
            <span className="navbar-username">
              {user.name} <small>({user.role})</small>
            </span>
            <button onClick={handleLogout} className="btn btn-ghost">
              Salir
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="btn btn-ghost">
              Entrar
            </NavLink>
            <NavLink to="/registro" className="btn btn-primary">
              Crear cuenta
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
}
