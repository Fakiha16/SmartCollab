import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/Layout";
import Performance from "../pages/Performance";
import Dashboard from "../pages/Dashboard";
import Team from "../pages/Team";
import Projects from "../pages/Projects";
import WorkLogs from "../pages/WorkLogs";
import ClientPanel from "../pages/ClientPanel";
import AccessControl from "../pages/AccessControl";
import Profile from "../pages/Profile";
import ProjectDetails from "../pages/ProjectDetails";

export default function ManagerRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="project/:id" element={<ProjectDetails />} />
        <Route path="work-logs" element={<WorkLogs />} />
        <Route path="client-panel" element={<ClientPanel />} />
        <Route path="access-control" element={<AccessControl />} />
        <Route path="profile" element={<Profile />} />
        <Route path="team" element={<Team />} />
        <Route path="performance" element={<Performance />} />


      </Route>

      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}