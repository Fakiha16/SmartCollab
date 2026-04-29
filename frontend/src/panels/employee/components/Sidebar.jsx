import React from "react";
import { NavLink, Link } from "react-router-dom";
import logo from "../../../assets/Logo.png";
import "./Sidebar.css";

const menus = [
  { to: "/manager/dashboard",      label: "Dashboard" },
  { to: "/manager/projects",       label: "Project" },
  { to: "/manager/work-logs",      label: "Work Logs" },
  { to: "/manager/client-panel",   label: "Client Panel" },
  { to: "/manager/access-control", label: "Access Control" },
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
            <div className="sc-brandTag">Manager Panel</div>
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