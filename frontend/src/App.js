import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Transactions from "./pages/TransactionsPage";
import GroupsPage from "./pages/GroupsPage";
import DashboardPage from "./pages/DashboardPage";
import SettingsPage from "./pages/SettingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminPage from "./pages/AdminPage";
import { getCurrentUser } from "./config/api";

function ProtectedRoute({ children }) {
  const user = getCurrentUser();
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
}

function PublicRoute({ children }) {
  const user = getCurrentUser();
  if (!user) return children;
  if (user.role === "admin") {
    return <Navigate to="/admin" />;
  }
  return <Navigate to="/dashboard" />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
        <Route path="/groups" element={<ProtectedRoute><GroupsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

        <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />

      </Routes>
    </Router>
  );
}