import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";  // You can keep Sidebar here, we'll hide it using CSS
import Topbar from "./Topbar";
import "../pages/Dashboard.css";

export default function Layout() {
  return (
    <div className="sc-app">
      {/* Sidebar is included but will be hidden */}
      <Sidebar />
      
      <div className="sc-main">
        <Topbar />
        
        <div className="sc-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
