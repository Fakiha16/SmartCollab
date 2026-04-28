import React from "react";
import { Outlet } from "react-router-dom";
import Topbar from "./Topbar";

export default function Layout() {
  return (
    <div className="sc-app">
      <div className="sc-main sc-main--full">
        <Topbar />
        <div className="sc-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}