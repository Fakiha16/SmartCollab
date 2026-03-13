import { Routes, Route, Navigate } from "react-router-dom";

import Signup from "../auth/Signup";
import Login from "../auth/Login";
import ForgotPassword from "../auth/ForgotPassword";
import ResetPassword from "../auth/ResetPassword";
import ProtectedRoute from "../auth/ProtectedRoute";
import ManagerRoutes from "../panels/manager/routes/ManagerRoutes";
import EmployeeRoutes from "../panels/employee/routes/EmployeeRoutes";
import ClientRoutes from "../panels/client/routes/ClientRoutes";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* AUTH */}
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* PANELS */}
      <Route
        path="/manager/*"
        element={
          <ProtectedRoute role="manager">
            <ManagerRoutes />
          </ProtectedRoute>
        }
/>

   <Route
  path="/employee/*"
  element={
    <ProtectedRoute role="employee">
      <EmployeeRoutes />
    </ProtectedRoute>
  }
/>

      <Route
  path="/client/*"
  element={
    <ProtectedRoute role="client">
      <ClientRoutes />
    </ProtectedRoute>
  }
/>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}