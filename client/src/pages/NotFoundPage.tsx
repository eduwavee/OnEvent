import { Link } from "react-router-dom";
import { Wordmark } from "../components/Wordmark";
import { IconCompass } from "../components/icons";

export function NotFoundPage() {
  return (
    <div className="not-found">
      <div className="not-found-icon">
        <IconCompass size={28} />
      </div>
      <span className="not-found-code">404</span>
      <h1>Esta página se perdió el evento</h1>
      <p>La ruta que buscás no existe o se movió de lugar.</p>
      <div className="not-found-actions">
        <Link to="/" className="btn btn-primary">
          Volver al inicio
        </Link>
        <Link to="/eventos" className="btn btn-ghost">
          Ver eventos
        </Link>
      </div>
      <div className="not-found-wordmark">
        <Wordmark size={16} />
      </div>
    </div>
  );
}
