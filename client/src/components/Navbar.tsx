import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { IconCalendar, IconLogIn, IconLogOut, IconShield } from "./icons";

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
        <IconCalendar size={20} />
        Gestión de Eventos
      </NavLink>
      <nav className="navbar-links">
        <NavLink to="/" end>
          Inicio
        </NavLink>
        <NavLink to="/eventos">Eventos</NavLink>
        {user?.role === "ATTENDEE" && <NavLink to="/mis-inscripciones">Mis inscripciones</NavLink>}
        {(user?.role === "ORGANIZER" || user?.role === "ADMIN") && (
          <NavLink to="/organizador">Mis eventos</NavLink>
        )}
        {user?.role === "ADMIN" && (
          <NavLink to="/admin" className="navbar-admin-link">
            <IconShield size={14} /> Panel admin
          </NavLink>
        )}
      </nav>
      <div className="navbar-user">
        {user ? (
          <>
            <span className="navbar-username">
              {user.name} <span className="role-tag">{user.role}</span>
            </span>
            <button onClick={handleLogout} className="btn btn-ghost btn-sm">
              <IconLogOut size={15} />
              Salir
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="btn btn-ghost btn-sm">
              <IconLogIn size={15} />
              Entrar
            </NavLink>
            <NavLink to="/registro" className="btn btn-primary btn-sm">
              Crear cuenta
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
}
