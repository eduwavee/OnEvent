import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOrganization } from "../api/organizations";
import { getErrorMessage } from "../api/client";
import { EventCard } from "../components/EventCard";
import { StaggerGrid, StaggerItem } from "../components/StaggerGrid";
import { SkeletonBlock, SkeletonCardGrid } from "../components/Skeleton";
import { IconCalendar, IconUsers } from "../components/icons";
import type { Event, Organization } from "../types";

const dateFormatter = new Intl.DateTimeFormat("es-ES", { dateStyle: "long" });

export function OrganizationPage() {
  const { id } = useParams<{ id: string }>();
  const [organization, setOrganization] = useState<(Organization & { createdAt: string }) | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getOrganization(id)
      .then((data) => {
        setOrganization(data.organization);
        setEvents(data.events);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="page">
        <SkeletonBlock height={100} />
        <SkeletonCardGrid />
      </div>
    );
  }

  if (!organization) return <p className="form-error">{error || "Organización no encontrada"}</p>;

  return (
    <div className="page">
      <div className="org-header">
        <div className="org-header-icon">
          <IconUsers size={26} />
        </div>
        <div>
          <h1>{organization.name}</h1>
          {organization.description && <p className="org-header-desc">{organization.description}</p>}
          <p className="meta-row">
            <span className="meta-item">
              <IconCalendar size={13} /> En la plataforma desde {dateFormatter.format(new Date(organization.createdAt))}
            </span>
          </p>
        </div>
      </div>

      <h2 className="org-events-heading">Eventos de esta organización</h2>
      {events.length === 0 ? (
        <p className="empty-state">Esta organización todavía no publicó eventos.</p>
      ) : (
        <StaggerGrid>
          {events.map((event) => (
            <StaggerItem key={event.id}>
              <EventCard event={event} />
            </StaggerItem>
          ))}
        </StaggerGrid>
      )}
    </div>
  );
}
