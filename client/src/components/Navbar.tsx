import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { IconLogIn, IconLogOut, IconMenu, IconShield, IconX } from "./icons";
import { Wordmark } from "./Wordmark";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Cierra el menú mobile al cambiar de ruta.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <NavLink to="/" className="navbar-brand">
        <Wordmark />
      </NavLink>

      <button
        className="navbar-mobile-toggle"
        onClick={() => setMobileOpen((v) => !v)}
        aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? <IconX size={20} /> : <IconMenu size={20} />}
      </button>

      <nav className={`navbar-links ${mobileOpen ? "open" : ""}`}>
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
        {user && (
          <NavLink to="/perfil" className="navbar-mobile-only-link">
            Mi perfil
          </NavLink>
        )}
      </nav>

      <div className="navbar-user">
        {user ? (
          <>
            <Link to="/perfil" className="navbar-username">
              {user.name} <span className="role-tag">{user.role}</span>
            </Link>
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
