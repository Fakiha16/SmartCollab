import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/Layout";

import Dashboard from "../pages/Dashboard";
import Performance from "../pages/Performance";
import Profile from "../pages/Profile";
import PerProjects from "../pages/PerProjects";
import PerformanceReport from "../pages/PerformanceReport";
import ProjecctDetails from "../pages/ProjectDetails";

export default function ClientRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="" element={<Navigate to="performance" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="performance" element={<Performance />} />
        <Route path="perprojects" element={<PerProjects />} />
        <Route path="performance-report/:id" element={<PerformanceReport />} />
        <Route path="/client/project/:projectId" element={<ProjecctDetails />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="performance" replace />} />
    </Routes>
  );
}