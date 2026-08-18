import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { CheckInPage } from "./pages/CheckInPage";
import { EventDetailPage } from "./pages/EventDetailPage";
import { EventFormPage } from "./pages/EventFormPage";
import { EventsListPage } from "./pages/EventsListPage";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { MyRegistrationsPage } from "./pages/MyRegistrationsPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { OrganizationPage } from "./pages/OrganizationPage";
import { OrganizerDashboardPage } from "./pages/OrganizerDashboardPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RegisterPage } from "./pages/RegisterPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/eventos" element={<EventsListPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />
      <Route path="/eventos/:id" element={<EventDetailPage />} />
      <Route path="/organizaciones/:id" element={<OrganizationPage />} />

      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/mis-inscripciones"
        element={
          <ProtectedRoute roles={["ATTENDEE"]}>
            <MyRegistrationsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/organizador"
        element={
          <ProtectedRoute roles={["ORGANIZER", "ADMIN"]}>
            <OrganizerDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/eventos/nuevo"
        element={
          <ProtectedRoute roles={["ORGANIZER", "ADMIN"]}>
            <EventFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/eventos/:id/editar"
        element={
          <ProtectedRoute roles={["ORGANIZER", "ADMIN"]}>
            <EventFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/eventos/:id/check-in"
        element={
          <ProtectedRoute roles={["ORGANIZER", "ADMIN"]}>
            <CheckInPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
