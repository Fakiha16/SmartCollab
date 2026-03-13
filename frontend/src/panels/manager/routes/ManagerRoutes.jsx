import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/Layout";

import Dashboard from "../pages/Dashboard";
import Projects from "../pages/Projects";
import WorkLogs from "../pages/WorkLogs";
import ClientPanel from "../pages/ClientPanel";
import AccessControl from "../pages/AccessControl";
import Profile from "../pages/Profile";

export default function ManagerRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="work-logs" element={<WorkLogs />} />
        <Route path="client-panel" element={<ClientPanel />} />
        <Route path="access-control" element={<AccessControl />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}