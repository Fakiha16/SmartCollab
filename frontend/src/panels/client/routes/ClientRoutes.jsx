import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/Layout";

import Dashboard from "../pages/Dashboard";
import Performance from "../pages/Performance";
import Profile from "../pages/Profile";
import PerProjects from "../pages/PerProjects";
import Tasks from "../pages/Tasks";
import WorkLogs from "../pages/WorkLogs";


export default function ClientRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="" element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="performance" element={<Performance />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="perprojects" element={<PerProjects />} />
        <Route path="worklogs" element={<WorkLogs />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}