import React from "react";
import { NavLink, Link } from "react-router-dom";

const menus = [
  { to: "/client/dashboard", label: "Dashboard" },
  { to: "/client/performance", label: "Performance" },
];

export default function Sidebar() {
  return (
    <aside className="sc-sidebar">
      <Link to="/dashboard" className="sc-brandLink">
        <div className="sc-brand">
          <div className="sc-brandLogo">SC</div>
          <div>
            <div className="sc-brandName">SmartCollab</div>
            <div className="sc-brandTag">Client Panel</div>
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