import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MyEvents from "./pages/MyEvents";
import CreateEventPage from "./pages/CreateEventPage";
import TicketsPage from "./pages/TicketsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import DashboardLayoutWrapper from "./components/dashboard-layout";
import SettingsPage from "./pages/SettingsPage";
import BrowseEventsPage from "./pages/BrowseEventsPage";
import MyTickets from "./pages/my-tickets";
import SignUpPage from "./pages/SignUpPage";
import SignInPage from "./pages/SignInPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RequireAuth from "./components/RequireAuth";
import EventDetailsPage from "./pages/EventDetailsPage";
import EventsPage from "./features/dashboard/EventsPage";

// Placeholder components for new routes
const AdminPanel = () => (
  <DashboardLayoutWrapper>
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      <p className="text-gray-600">
        Administrative controls and system management.
      </p>
    </div>
  </DashboardLayoutWrapper>
);

const ManageUsers = () => (
  <DashboardLayoutWrapper>
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Users</h1>
      <p className="text-gray-600">User management and administration.</p>
    </div>
  </DashboardLayoutWrapper>
);

const SystemAnalytics = () => (
  <DashboardLayoutWrapper>
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">System Analytics</h1>
      <p className="text-gray-600">System-wide analytics and monitoring.</p>
    </div>
  </DashboardLayoutWrapper>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <RequireAuth>
                <EventsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/my-events"
            element={
              <RequireAuth>
                <MyEvents />
              </RequireAuth>
            }
          />
          <Route
            path="/create-event"
            element={
              <RequireAuth>
                <DashboardLayoutWrapper>
                  <CreateEventPage />
                </DashboardLayoutWrapper>
              </RequireAuth>
            }
          />
          <Route
            path="/tickets"
            element={
              <RequireAuth>
                <TicketsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/browse-events"
            element={
              <RequireAuth>
                <BrowseEventsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/my-tickets"
            element={
              <RequireAuth>
                <MyTickets />
              </RequireAuth>
            }
          />
          <Route
            path="/analytics"
            element={
              <RequireAuth>
                <AnalyticsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/settings"
            element={
              <RequireAuth>
                <SettingsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <AdminPanel />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/users"
            element={
              <RequireAuth>
                <ManageUsers />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <RequireAuth>
                <SystemAnalytics />
              </RequireAuth>
            }
          />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="/reset-password/:token"
            element={<ResetPasswordPage />}
          />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route
            path="/events/:id"
            element={
              <RequireAuth>
                <EventDetailsPage />
              </RequireAuth>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
