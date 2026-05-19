import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../../assets/Logo.png";
import "./Topbar.css";

export default function Topbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }
  }, []);

  const userName = user?.name || "Client";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="sc-topbar">
      <div className="sc-left">
        <div className="sc-logo">
          <Link to="" className="sc-brandLink">
            <div className="sc-brand">
              <img src={logo} alt="SmartCollab Logo" className="sc-brandLogoImg" />
              <div>
                <div className="sc-brandName">SmartCollab</div>
                <div className="sc-brandTag">Client Panel</div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="sc-center">
        <div className="sc-search">
          <span className="sc-searchIcon">⌕</span>
          <input placeholder="Search anything..." className="sc-searchInput" />
        </div>
      </div>

      <div className="sc-right">
        <button className="sc-iconBtn" title="Notifications" type="button">
          🔔
        </button>
        <button
          type="button"
          className="sc-user sc-userBtn"
          onClick={() => navigate("/client/profile")}
          title="Open Profile"
        >
          <div className="sc-userMeta">
            <div className="sc-userName">{userName}</div>
            <div className="sc-muted">Pakistan</div>
          </div>
          <div className="sc-userAvatar">{userInitial}</div>
        </button>
      </div>
    </div>
  );
}