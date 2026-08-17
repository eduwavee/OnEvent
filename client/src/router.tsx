import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { CheckInPage } from "./pages/CheckInPage";
import { EventDetailPage } from "./pages/EventDetailPage";
import { EventFormPage } from "./pages/EventFormPage";
import { EventsListPage } from "./pages/EventsListPage";
import { LoginPage } from "./pages/LoginPage";
import { MyRegistrationsPage } from "./pages/MyRegistrationsPage";
import { OrganizerDashboardPage } from "./pages/OrganizerDashboardPage";
import { RegisterPage } from "./pages/RegisterPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<EventsListPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />
      <Route path="/eventos/:id" element={<EventDetailPage />} />

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
    </Routes>
  );
}
