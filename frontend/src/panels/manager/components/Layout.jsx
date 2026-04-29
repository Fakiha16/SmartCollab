import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "../pages/Dashboard.css";

export default function Layout() {
  return (
    <div className="sc-app" style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar - fixed left */}
      <Sidebar />
      
      {/* Main content shifts right to avoid sidebar overlap */}
      <div
        className="sc-main"
        style={{
          marginLeft: "var(--sidebar-width, 250px)", /* sidebar ki width match karein */
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <Topbar />
        
        <div className="sc-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}