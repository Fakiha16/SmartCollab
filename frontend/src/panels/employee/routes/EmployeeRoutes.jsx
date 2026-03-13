import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/Layout";

import Dashboard from "../pages/Dashboard";
import Performance from "../pages/Performance";
import PerProjects from "../pages/PerProjects";
import Tasks from "../pages/Tasks";
import WorkLogs from "../pages/WorkLogs";
import Profile from "../pages/Profile";

export default function EmployeeRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="dashboard" replace />} />

        <Route path="dashboard" element={<Dashboard standalone={false} />} />
        <Route path="performance" element={<Performance />} />
        <Route path="projects" element={<PerProjects />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="work-logs" element={<WorkLogs />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}