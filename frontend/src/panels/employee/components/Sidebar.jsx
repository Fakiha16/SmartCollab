import React from "react";
import { NavLink, Link } from "react-router-dom";

const menus = [
  { to: "/employee/dashboard", label: "Dashboard" },
  { to: "/employee/performance", label: "Performance" },
  { to: "/employee/work-logs", label: "Work Logs" },
  { to: "/employee/Tasks", label: "Tasks" }, // agar tasks ka page nahi hai to profile ya remove
];

export default function Sidebar() {
  return (
    <aside className="sc-sidebar">
      <Link to="/dashboard" className="sc-brandLink">
        <div className="sc-brand">
          <div className="sc-brandLogo">SC</div>
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