import { IconCalendar } from "./icons";

/** Marca "OnEvent": "On" en azul con destello, "Event" en gris claro. Reutilizada en navbar, auth y 404. */
export function Wordmark({ size = 20, withIcon = true }: { size?: number; withIcon?: boolean }) {
  return (
    <span className="wordmark">
      {withIcon && <IconCalendar size={size} className="wordmark-icon" />}
      <span className="wordmark-on">On</span>
      <span className="wordmark-event">Event</span>
    </span>
  );
}
