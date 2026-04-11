import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Transactions from "./pages/TransactionsPage";
import GroupsPage from "./pages/GroupsPage";
import DashboardPage from "./pages/DashboardPage";
import SettingsPage from "./pages/SettingPage";

// NEW
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/settings" element={<SettingsPage />} />

      </Routes>
    </Router>
  );
}