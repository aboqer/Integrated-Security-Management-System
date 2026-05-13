import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../providers/AuthProvider";
import { ProtectedRoute, PublicOnlyRoute } from "./RouteGuards";
import { AppShell } from "../layouts/AppShell";
import { DashboardPage } from "../../modules/dashboard/pages/DashboardPage";
import { LoginPage } from "../../modules/auth/pages/LoginPage";
import { ViolationsPage } from "../../modules/violations/pages/ViolationsPage";
import { DetaineesPage } from "../../modules/detainees/pages/DetaineesPage";
import { PropertyPage } from "../../modules/property/pages/PropertyPage";
import { ReportsPage } from "../../modules/reports/pages/ReportsPage";
import { CommitmentsPage } from "../../modules/commitments/pages/CommitmentsPage";
import { SettingsPage } from "../../modules/settings/pages/SettingsPage";

export function AppRouter() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AppShell><DashboardPage /></AppShell>} />
            <Route path="/violations" element={<AppShell><ViolationsPage /></AppShell>} />
            <Route path="/detainees" element={<AppShell><DetaineesPage /></AppShell>} />
            <Route path="/property" element={<AppShell><PropertyPage /></AppShell>} />
            <Route path="/reports" element={<AppShell><ReportsPage /></AppShell>} />
            <Route path="/commitments" element={<AppShell><CommitmentsPage /></AppShell>} />
            <Route path="/settings" element={<AppShell><SettingsPage /></AppShell>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
