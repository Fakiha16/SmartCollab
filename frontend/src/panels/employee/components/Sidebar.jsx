import React from "react";
import { NavLink, Link } from "react-router-dom";
import logo from "../../../assets/Logo.png";
import "./Sidebar.css";

const menus = [
  { to: "/employee/dashboard",      label: "Dashboard" },
  { to: "/employee/performance",       label: "Performance" },
  { to: "/emeployee/work-logs",      label: "WorkLogs" },
  { to: "/employee/tasks", label: "Task" }
];

export default function Sidebar() {
  return (
    <aside className="sc-sidebar">
      <Link to="" className="sc-brandLink">
        <div className="sc-brand">
          {/* ✅ Logo image instead of text */}
          <img src={logo} alt="SmartCollab Logo" className="sc-brandLogoImg" />
          <div>
            <div className="sc-brandName">SmartCollab</div>
            <div className="sc-brandTag">Employee Panel</div>
          </div>
        </div>
      </Link>

      <nav className="sc-nav">
        {menus.map((m) => (
          <NavLink
            key={m.to}
            to={m.to}
            className={({ isActive }) =>
              `sc-navItem ${isActive ? "sc-navActive" : ""}`
            }
          >
            <span className="sc-dot" />
            <span>{m.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}