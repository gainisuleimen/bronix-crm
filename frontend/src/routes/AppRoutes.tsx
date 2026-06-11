import { Route, Routes } from "react-router-dom";

import { ClientsPage } from "./ClientsPage";
import { LeadsPage } from "./LeadsPage";
import { AboutPage } from "./AboutPage";
import { ContactsPage } from "./ContactsPage";
import { TeamPage } from "./TeamPage";
import { GuestRoute } from "./GuestRoute";
import { HomePage } from "./HomePage";
import { LoginPage } from "./LoginPage";
import { NotFoundPage } from "./NotFoundPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { RegisterPage } from "./RegisterPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            <ClientsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leads"
        element={
          <ProtectedRoute>
            <LeadsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/team"
        element={
          <ProtectedRoute>
            <TeamPage />
          </ProtectedRoute>
        }
      />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contacts" element={<ContactsPage />} />
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
